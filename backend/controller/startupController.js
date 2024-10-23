import Startup from "../models/startupModel.js";
import _ from "lodash";
import { convertObjectToUrl } from "../utils.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/userModel.js";
import { setSkillsAndGetIDs } from "./userController.js";
import startupSchema from "../validationSchemas/startupValidationSchema.js";
import { Industry, BusinessModel, InvestmentStage } from "../enums.js";

const findAll = async (req, res) => {
  try {
    const startups = await Startup.find();
    startups.forEach((startup) => {
      if (startup.startupLogo && startup.startupLogo.data) {
        convertObjectToUrl(startup.startupLogo);
      }
    });
    return res.status(200).send(startups);
  } catch (error) {
    console.error("Error finding all startups:", error);
    return res.status(500).send("Internal server error");
  }
};

const findByID = async (req, res) => {
  try {
    const { id } = req.params;
    const startup = await Startup.findById(id);

    if (!startup) {
      return res.status(404).send("Item not found");
    }

    if (startup.startupLogo && startup.startupLogo.data) {
      convertObjectToUrl(startup.startupLogo);
    }

    return res.status(200).send(startup);
  } catch (error) {
    console.error("Error finding startup by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const deleteByID = async (req, res) => {
  try {
    const { id } = req.params;
    await Startup.findByIdAndDelete(id);
    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error deleting startup by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const createOrEditStartup = async (req, res) => {
  try {
    // Validate the request body against the schema
    const { error, value } = startupSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      // If validation fails, return a 400 error with the validation details
      return res.status(400).json({ error: error.details[0].message });
    }

    const { _id: id } = req.body;
    const jobOffers = req.body.jobOffers ? JSON.parse(req.body.jobOffers) : [];
    for (let i = 0; i < jobOffers.length; i++) {
      const skillIds = await setSkillsAndGetIDs(jobOffers[i].requiredSkills);
      jobOffers[i].requiredSkills = skillIds;
    }
    // Fields to be updated or created
    const update = {
      startupName: req.body.startupName,
      industry: req.body.industry ? JSON.parse(req.body.industry) : {},
      businessModel: req.body.businessModel
        ? JSON.parse(req.body.businessModel)
        : {},
      investmentStage: req.body.investmentStage
        ? JSON.parse(req.body.investmentStage)
        : {},
      requiredResources: req.body.requiredResources,
      websiteURL: req.body.websiteURL,
      coFounders: req.body.coFounders ? JSON.parse(req.body.coFounders) : [],
      slogan: req.body.slogan,
      shortDescription: req.body.shortDescription,
      longDescription: req.body.longDescription,
      jobOffers: jobOffers,
    };

    // Validate shortDescription length
    if (update.shortDescription && update.shortDescription.length > 200) {
      return res
        .status(400)
        .send("Short description cannot exceed 200 characters.");
    }

    // This updates the profile picture to either nothing when it was removed or to the updated picturre
    if (req.body.startupLogo === "") {
      update.startupLogo = null;
    }
    if (req.body.startupLogo) {
      // This part converts the image url string and saves it as a buffer
      const base64String = req.body.startupLogo.split(",")[1];
      // Convert the base64 string to a Buffer
      const buffer = Buffer.from(base64String, "base64");
      // Extract the image type from the data URL
      const imageType = req.body.startupLogo.split(";")[0].split(":")[1];

      update.startupLogo = {
        data: buffer,
        imageType: imageType,
      };
    }

    let startup;

    // If startup already exists update or create new one
    if (id) {
      startup = await Startup.findByIdAndUpdate(id, update, {
        new: true,
      });

      if (!startup) {
        return res.status(404).send("Startup not found with provided ID");
      }

      return res.status(200).send(startup);
    } else {
      update.invitationCode = uuidv4(); // create initial invitation code
      startup = new Startup(update);
      let newStartup = await startup.save();
      return res.status(201).send(newStartup);
    }
  } catch (error) {
    console.error("Error editing Startup:", error);
    return res.status(500).send("Internal server error");
  }
};

const removeCoFounderByID = async (req, res) => {
  const { _id: userId } = req.body;

  try {
    // Delete all startups where the user is the only coFounder
    await Startup.deleteMany({ coFounders: { $in: [userId], $size: 1 } });

    //Remove user from other startups as coFounder
    await Startup.updateMany(
      { coFounders: { $in: [userId] } },
      { $pull: { coFounders: userId } }
    );
    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error deleting cofounder by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const findByUserID = async (req, res) => {
  try {
    const { userId } = req.params;
    //find startup where userId is in coFounders

    const startup = await Startup.findOne({ coFounders: userId });

    if (!startup) {
      return res.status(404).send("Startup not found");
    }

    if (startup.startupLogo && startup.startupLogo.data) {
      convertObjectToUrl(startup.startupLogo);
    }

    return res.status(200).send(startup);
  } catch (error) {
    console.error("Error finding startup by userID:", error);
    return res.status(500).send("Internal server error");
  }
};

// this is used for inviting coFounders via invitation link
const getInvitationCode = async (req, res) => {
  try {
    const startupID = req.params.startupId;
    const startup = await Startup.findById(startupID);
    if (!startup) {
      return res.status(404).send("Startup not found");
    }
    const code = uuidv4();
    startup.invitationCode.push(code);
    await startup.save();
    return res.status(200).send({
      code: code,
    });
  } catch (error) {
    console.error("Error getting invitation code:", error);
    return res.status(500).send("Internal server error");
  }
};

// this is used for inviting coFounders via invitation link
const validateInvitation = async (req, res) => {
  try {
    const { code, userId } = req.query;
    const startup = await Startup.findOne({ invitationCode: code });
    if (!startup) {
      return res.status(404).send("Invalid invitation code");
    }
    const hasLogo = startup.startupLogo && startup.startupLogo.data;
    if (startup.startupLogo && startup.startupLogo.data) {
      convertObjectToUrl(startup.startupLogo);
    }
    return res.status(200).send({
      valid: true,
      company_id: startup._id,
      company_name: startup.startupName,
      company_image: startup.startupLogo,
      company_has_logo: hasLogo,
      message:
        "Invitation validated and Investment Institution information loaded.",
    });
  } catch (error) {
    console.error("Error validating invitation code:", error);
    return res.status(500).send("Internal server error");
  }
};

// this is used for inviting coFounders via invitation link
const answerInvitation = async (req, res) => {
  try {
    const { code, userId, accept } = req.body;
    const user = await User.findById(userId);
    const userHasStartuup = await Startup.findOne({ coFounders: userId });
    if (user.profession !== "student") {
      return res.status(403).send("User is not an student");
    }
    const startup = await Startup.findOne({ invitationCode: code });
    if (!startup) {
      return res.status(404).send("Invalid invitation code");
    }
    if (accept) {
      if (!startup.coFounders.includes(userId) && !userHasStartuup) {
        startup.coFounders.push(userId);
      } else {
        return res.status(409).send("User already part of Startup");
      }
    }
    startup.invitationCode = startup.invitationCode.filter(
      (invCode) => invCode !== code
    ); // remove the code from the list independent of the answer
    if (startup.invitationCode.length === 0) {
      startup.invitationCode.push(uuidv4());
    }
    await startup.save();
    return res.status(200).send(startup._id);
  } catch (error) {
    console.error("Error answering invitation:", error);
    return res.status(500).send("Internal server error");
  }
};

// This is used for lazy loading all startups on the overview page
const getStartupsByPage = async (req, res) => {
  try {
    const { page, limit, order } = req.query;
    if (!page || !limit) {
      return res
        .status(400)
        .send("Page and limit query parameters are required");
    }

    let startups;

    if (order === "asc" || order === "desc") {
      startups = await Startup.find()
        .sort({ createdAt: order === "asc" ? 1 : -1 })
        .skip(page * limit)
        .limit(limit);
    } else {
      if (order === "alphabetical") {
        startups = await Startup.find()
          .sort({ startupName: 1 })
          .skip(page * limit)
          .limit(limit);
      } else {
        return res.status(400).send("Invalid order parameter");
      }
    }

    startups.forEach((startup) => {
      if (startup.startupLogo && startup.startupLogo.data) {
        convertObjectToUrl(startup.startupLogo);
      }
    });

    //get the total number of startups
    const totalStartups = await Startup.countDocuments();

    return res
      .status(200)
      .send({ startups: startups, totalStartups: totalStartups });
  } catch (error) {
    console.error("Error finding all startups:", error);
    return res.status(500).send("Internal server error");
  }
};

const getStartupEnums = async (req, res) => {
  const enums = { Industry, BusinessModel, InvestmentStage };
  return res.status(200).send(enums);
};

export {
  findAll,
  findByID,
  deleteByID,
  createOrEditStartup,
  findByUserID,
  getInvitationCode,
  validateInvitation,
  answerInvitation,
  getStartupsByPage,
  getStartupEnums,
  removeCoFounderByID,
};
