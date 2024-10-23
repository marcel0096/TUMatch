import {
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
  getUserProfilePageEnums,
} from "../controller/userController.js";
import checkAuthentication from "../middleware/authMiddleware.js";
import upload from "../middleware/fileMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/getAll", checkAuthentication, findAll);
router.get("/byID/:id", checkAuthentication, findByID);
router.get("/byEmail/:email", checkAuthentication, findByEmail);
router.delete("/delete/:id", checkAuthentication, deleteByID);
router.get("/getProfilePicture/:id", checkAuthentication, getProfilePicture);
router.post(
  "/addUserInfo",
  checkAuthentication,
  upload.none(), // Parses the multi part form data
  editUser
);
router.get("/getUsersNamesAndIds", checkAuthentication, getUsersNamesAndIds);
router.get("/search", checkAuthentication, searchUsers);
router.get("/skills/getAll", checkAuthentication, getAllSkills);
router.post("/getSkillNames", checkAuthentication, getSkillsByIds);
router.get("/get-profile-enums", getUserProfilePageEnums);

export default router;
