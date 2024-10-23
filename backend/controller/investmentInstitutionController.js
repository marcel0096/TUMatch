import _ from "lodash";
import { v4 as uuidv4 } from "uuid";
import { convertObjectToUrl } from "../utils.js";
import InvestmentInstitution from "../models/investmentInstitutionModel.js";
import User from "../models/userModel.js";
import { checkMaxEmployees } from "./paymentController.js";
import investmentInstitutionValidationSchema from "../validationSchemas/investmentInstitutionValidationSchema.js";

const findByID = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await InvestmentInstitution.findById(id);

    if (!company) {
      return res.status(404).send("Company not found");
    }

    if (company.companyLogo && company.companyLogo.data) {
      convertObjectToUrl(company.companyLogo);
    }

    return res.status(200).send(company);
  } catch (error) {
    console.error("Error finding company by ID: ", error);
    return res.status(500).send("Internal server error");
  }
};

const deleteByID = async (req, res) => {
  try {
    const { id } = req.params;
    await InvestmentInstitution.findByIdAndDelete(id);
    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error deleting company by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const createOrEditCompany = async (req, res) => {
  try {
    // Validate the request body against the schema
    const { error, value } = investmentInstitutionValidationSchema.validate(
      req.body,
      {
        abortEarly: false,
      }
    );

    if (error) {
      // If validation fails, return a 400 error with the validation details
      return res.status(400).json({ error: error.details[0].message });
    }

    // continue with updating the investment institution
    const { _id: id } = req.body;
    const update = {
      companyName: req.body.companyName,
      rangeOfInvestment: req.body.rangeOfInvestment,
      websiteURL: req.body.websiteURL,
      invitationCode: req.body.invitationCode,
      slogan: req.body.slogan,
      description: req.body.description,
      industries: req.body.industries ? JSON.parse(req.body.industries) : [],
      investorType: req.body.investorType
        ? JSON.parse(req.body.investorType)
        : "",
      employees: req.body.employees ? JSON.parse(req.body.employees) : [],
    };

    // This updates the profile picture to either nothing when it was removed or to the updated picture
    if (req.body.companyLogo === "") {
      update.companyLogo = null;
    }
    if (req.body.companyLogo) {
      // This part converts the image url string and saves it as a buffer
      const base64String = req.body.companyLogo.split(",")[1];
      // Convert the base64 string to a Buffer
      const buffer = Buffer.from(base64String, "base64");
      // Extract the image type from the data URL
      const imageType = req.body.companyLogo.split(";")[0].split(":")[1];

      update.companyLogo = {
        data: buffer,
        imageType: imageType,
      };
    }

    let company;

    // If startup already exists update or create new one
    if (id) {
      company = await InvestmentInstitution.findByIdAndUpdate(id, update, {
        new: true,
      });

      if (!company) {
        return res.status(404).send("Company not found with provided ID");
      }

      return res.status(200).send("Company updated successfully");
    } else {
      // If company ID is not provided, create a new company
      update.invitationCode = uuidv4(); // create initial invitation code
      company = new InvestmentInstitution(update);
      await company.save();
      return res.status(201).send("Company created successfully");
    }
  } catch (error) {
    console.error("Error editing company:", error);
    return res.status(500).send("Internal server error");
  }
};

const removeEmployeeByID = async (req, res) => {
  const { _id: userId } = req.body;

  try {
    // Delete all startups where the user is the only coFounder
    await InvestmentInstitution.deleteMany({
      employees: { $in: [userId], $size: 1 },
    });

    // Remove user from other startups as coFounder
    await InvestmentInstitution.updateMany(
      { employees: { $in: [userId] } },
      { $pull: { employees: userId } }
    );
    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error deleting cofounder by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const findByEmployeeID = async (req, res) => {
  try {
    const userId = req.params.employeeId;
    const company = await InvestmentInstitution.findOne({ employees: userId });
    if (!company) {
      return res.status(404).send(InvestmentInstitution + " not found");
    }

    if (company.companyLogo && company.companyLogo.data) {
      convertObjectToUrl(company.companyLogo);
    }

    return res.status(200).send(company);
  } catch (error) {
    console.error(
      "Error finding company of type ",
      InvestmentInstitution,
      " by userID:",
      error
    );
    return res.status(500).send("Internal server error");
  }
};

// used for inviting employees via invite link
const getInvitationCode = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const company = await InvestmentInstitution.findById(companyId);
    if (!company) {
      return res.status(404).send("Company not found");
    }
    const code = uuidv4();
    company.invitationCode.push(code);
    await company.save();
    return res.status(200).send({
      code: code,
    });
  } catch (error) {
    console.error("Error getting invitation code:", error);
    return res.status(500).send("Internal server error");
  }
};

// used for inviting employees via invite link
const validateInvitation = async (req, res) => {
  try {
    const { code } = req.query;
    const company = await InvestmentInstitution.findOne({
      invitationCode: code,
    });
    if (!company) {
      return res.status(404).send("Invalid invitation code");
    }
    const hasLogo = company.companyLogo && company.companyLogo.data;
    if (company.companyLogo && company.companyLogo.data) {
      convertObjectToUrl(company.companyLogo);
    }
    return res.status(200).send({
      valid: true,
      company_id: company._id,
      company_name: company.companyName,
      company_image: company.companyLogo,
      company_has_logo: hasLogo,
      message:
        "Invitation validated and Investment Institution information loaded.",
    });
  } catch (error) {
    console.error("Error validating invitation code:", error);
    return res.status(500).send("Internal server error");
  }
};

// used for inviting employees via invite link
const answerInvitation = async (req, res) => {
  try {
    const { code, userId, accept } = req.body;
    const user = await User.findById(userId);
    if (user.profession !== "investor") {
      return res.status(403).send("User is not an investor");
    }
    const company = await InvestmentInstitution.findOne({
      invitationCode: code,
    });
    if (!company) {
      return res.status(404).send("Invalid invitation code");
    }
    const employeeNumber = company.employees.length;
    const maxEmployees = await checkMaxEmployees(company);
    if (accept) {
      if (!company.employees.includes(userId)) {
        if (employeeNumber + 1 <= maxEmployees) {
          company.employees.push(userId);
        } else {
          return res
            .status(409)
            .send("Company has reached the maximum number of employees");
        }
      } else {
        return res.status(409).send("User already part of company");
      }
    }
    company.invitationCode = company.invitationCode.filter(
      (invCode) => invCode !== code
    );
    // if invitationCode list is empty create new one
    if (company.invitationCode.length === 0) {
      company.invitationCode.push(uuidv4());
    }
    await company.save();
    return res.status(200).send(company._id);
  } catch (error) {
    console.error("Error answering invitation:", error);
    return res.status(500).send("Internal server error");
  }
};

export {
  findByID,
  deleteByID,
  createOrEditCompany,
  findByEmployeeID,
  getInvitationCode,
  validateInvitation,
  answerInvitation,
  removeEmployeeByID,
};
