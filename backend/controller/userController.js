import User from "../models/userModel.js";
import Startup from "../models/startupModel.js";
import Skill from "../models/skillModel.js";
import Chat from "../models/chatModel.js";
import InvestmentInstitution from "../models/investmentInstitutionModel.js";
import { convertObjectToUrl } from "../utils.js";
import mongoose from "mongoose";
import userSchema from "../validationSchemas/userValidationSchema.js";
import investorSchema from "../validationSchemas/investorValidationSchema.js";
import { Programs } from "../enums.js";

const findAll = async (req, res) => {
  try {
    let users = await User.find();
    return res.status(200).send(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).send("Internal server error");
  }
};

const findByID = async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.profilePicture && user.profilePicture.data) {
      convertObjectToUrl(user.profilePicture);
    }

    return res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return res.status(500).send("Internal server error");
  }
};

const findByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    let user = await User.where({ email: email });
    return res.status(200).send(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Deletes a user from the database. Also deletes all startups where the user is the only co-founder
 * and removes the user from other startups as a co-founder. Also deletes all investment institutions
 * where the user is the only investor and removes the user from other investment institutions as an investor.
 * If an investor is deleted, the subscription is stopped as well.
 * Finally, deletes all chats where the user is a participant.
 *
 */
const deleteByID = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    let userId = new mongoose.Types.ObjectId(id);

    // Check if the user exists
    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.profession === "student") {
      // Delete all startups where the user is the only coFounder
      await Startup.deleteMany({ coFounders: { $in: [userId], $size: 1 } });

      //Remove user from other startups as coFounder
      await Startup.updateMany(
        { coFounders: { $in: [userId] } },
        { $pull: { coFounders: user._id } }
      );
    }

    if (user.profession === "investor") {
      // Delete all investment institutions where the user is the only investor

      //if user is the payer of investment institution subscription, delete the subscription
      let institution = await InvestmentInstitution.findOne({
        employees: userId,
      });
      if (institution) {
        if (institution.subscription) {
          if (institution.subscription.payerId._id.toHexString() == userId) {
            await cancelSubscriptionBySubscriptionId(
              institution.subscription.subscriptionId
            );
            institution.subscription = null;
            await institution.save();
          }
        }
      }

      //log the entire investement insitutions table
      await InvestmentInstitution.deleteMany({
        employees: { $in: [userId], $size: 1 },
      });

      //Remove user from other investment institutions as investor
      await InvestmentInstitution.updateMany(
        { employees: { $in: [userId] } },
        { $pull: { employees: userId } }
      );
    }

    // Delete all chats where the user is a participant
    await Chat.deleteMany({ participants: { $in: [userId] } });

    //Delete the user
    await User.findByIdAndDelete(id);

    return res.status(200).send("ok");
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Asynchronously fetches an array of skills from the database.
 */
const getSkillsByIds = async (req, res) => {
  let skills = [];
  try {
    const skillIds = req.body;
    for (let i = 0; i < skillIds.length; i++) {
      let skill;
      skill = await Skill.findById(skillIds[i]);
      if (!skill) {
        return res.status(404).send("Skill not found");
      }
      skills.push(skill);
    }
    return res.status(200).send(skills);
  } catch (error) {
    console.error("Error fetching skills by IDs:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Fetches all skills from the database.
 */
const getAllSkills = async (req, res) => {
  try {
    let skills = await Skill.find();
    return res.status(200).send(skills);
  } catch (error) {
    console.error("Error fetching skills:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Asynchronously processes an array of skills, ensuring each skill is stored in the database.
 * For each skill, it checks if the skill already exists in the database by its value.
 * If it does not exist, it creates a new skill entry. Finally, it returns an array of skill IDs.
 */
const setSkillsAndGetIDs = async (skills) => {
  let skillIds = []; // result array that will be returned containing ids of all skills
  try {
    for (let i = 0; i < skills.length; i++) {
      // loop through all skills
      let skill;
      if (skills[i].value) {
        skill = await Skill.findOne({ value: skills[i].value }); // check if skill value is present in database
      } else {
        // if skill value is not present, return error
        return res.status(400).send("Skill value is required");
      }
      if (!skill) {
        // if skill is not present in database, create new skill
        skill = new Skill({
          label: skills[i].label,
          value: skills[i].value,
        });
      }
      await skill.save(); // save the skill
      skillIds.push(skill._id); // add id of the skill to the skillIds array
    }
    return skillIds;
  } catch (error) {
    console.error("Error setting skills and getting IDs:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Helper function to check if a value is in the enum
 */
const isValidProgram = (program, enums) => {
  return Object.values(enums).includes(program);
};

const editUser = async (req, res) => {
  try {
    if (req.body.profession === "investor") {
      // Validate the request body against the schema
      const { error, value } = investorSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        // If validation fails, return a 400 error with the validation details
        return res.status(400).json({ error: error.details[0].message });
      }
    } else {
      // Validate the request body against the schema
      const { error, value } = userSchema.validate(req.body, {
        abortEarly: false,
      });

      if (error) {
        // If validation fails, return a 400 error with the validation details
        return res.status(400).json({ error: error.details[0].message });
      }
    }

    const { _id: id } = req.body;
    const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
    const skillIds = await setSkillsAndGetIDs(skills);

    // Fields to be updated
    const update = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      position: req.body.position,
      dateOfBirth: req.body.dateOfBirth,
      selfDescription: req.body.selfDescription,
      linkedinURL: req.body.linkedinURL,
      studyPrograms: req.body.studyPrograms
        ? JSON.parse(req.body.studyPrograms).sort((a, b) => {
            return new Date(b.startDate) - new Date(a.startDate);
          })
        : [],
      jobPositions: req.body.jobPositions
        ? JSON.parse(req.body.jobPositions).sort((a, b) => {
            return new Date(b.startDate) - new Date(a.startDate);
          })
        : [],
      extraCurricularPositions: req.body.extraCurricularPositions
        ? JSON.parse(req.body.extraCurricularPositions).sort((a, b) => {
            return new Date(b.startDate) - new Date(a.startDate);
          })
        : [],
      skills: skillIds,
    };

    // This updates the profile picture to either nothing when it was removed or to the updated picturre
    if (req.body.profilePictureUrl === "") {
      update.profilePicture = null;
    }
    if (req.body.profilePictureUrl) {
      // This part converts the image url string and saves it as a buffer
      const base64String = req.body.profilePictureUrl.split(",")[1];
      // Convert the base64 string to a Buffer
      const buffer = Buffer.from(base64String, "base64");
      // Extract the image type from the data URL
      const imageType = req.body.profilePictureUrl.split(";")[0].split(":")[1];

      update.profilePicture = {
        data: buffer,
        imageType: imageType,
      };
    }

    let user;

    if (id) {
      user = await User.findByIdAndUpdate(id, update, { new: true });

      if (!user) {
        return res.status(404).send("User not found with provided ID");
      }

      return res.status(200).send("User updated successfully");
    } else {
      return res.status(404).send("Cannot find user without ID");
    }
  } catch (error) {
    console.error("Error editing user:", error);
    return res.status(500).send("Internal server error");
  }
};

/**
 * Fetches the first name, last name, and ID of all users from the database.
 */
const getUsersNamesAndIds = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({});
    // Map over the users to extract only the required fields
    const usersNamesAndIds = users.map((user) => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    }));
    // Return the mapped array
    return res.status(200).send(usersNamesAndIds);
  } catch (error) {
    console.error("Error fetching user names and IDs:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

/**
 * Searches for users based on a search query.
 */
const searchUsers = async (req, res) => {
  try {
    const searchQuery = req.query.q; // Get the search query from the request
    if (!searchQuery) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // case insensitive regex searching for word starting with the search query string
    const regex = new RegExp(`^${searchQuery}`, "i");

    const users = await User.find({
      // either first or last name can start with the query string
      $or: [{ firstName: { $regex: regex } }, { lastName: { $regex: regex } }],
    }).select("firstName lastName profession profilePicture");

    const newUsers = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      profession: user.profession,
      profilePicture: convertObjectToUrl(user.profilePicture),
    }));

    return res.status(200).send(newUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Fetches the profile picture of a user.
 */
const getProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    //get profile picture
    let user = await User.findById(id);

    if (user.profilePicture && user.profilePicture.data) {
      convertObjectToUrl(user.profilePicture);
    }

    return res.status(200).send(user.profilePicture);
  } catch (error) {
    console.error("Error getting profile picture:", error);
    return res.status(500).send("Internal server error");
  }
};

const getUserProfilePageEnums = async (req, res) => {
  try {
    const enums = { Programs };
    return res.status(200).send(enums);
  } catch (error) {
    console.error("Error fetching enums:", error);
    return res.status(500).send("Internal server error");
  }
};

export {
  findAll,
  findByID,
  findByEmail,
  deleteByID,
  editUser,
  getUsersNamesAndIds,
  searchUsers,
  getProfilePicture,
  getAllSkills,
  getSkillsByIds,
  setSkillsAndGetIDs,
  getUserProfilePageEnums,
};
