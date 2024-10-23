import {
  findAll,
  findByID,
  deleteByID,
  createOrEditStartup,
  findByUserID,
  validateInvitation,
  answerInvitation,
  getInvitationCode,
  getStartupsByPage,
  getStartupEnums,
  removeCoFounderByID,
} from "../controller/startupController.js";
import { getRecommendedStartups } from "../controller/recommendationEngineController.js";
import checkAuthentication from "../middleware/authMiddleware.js";
import upload from "../middleware/fileMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/getAll", checkAuthentication, findAll);
router.get("/byID/:id", checkAuthentication, findByID);
router.get("/byUserID/:userId", checkAuthentication, findByUserID);
router.get("/invite/validate", validateInvitation);
router.get(
  "/getInvitationCode/:startupId",
  checkAuthentication,
  getInvitationCode
);
router.post("/invite/respond", checkAuthentication, answerInvitation);
router.delete("/delete/:id", checkAuthentication, deleteByID);
router.post(
  "/addStartupInfo",
  upload.none(), // Parses the multi part form data
  createOrEditStartup
);
router.post(
  "/getRecommendedStartups",
  checkAuthentication,
  getRecommendedStartups
);
router.post("/removeCofounderByID", checkAuthentication, removeCoFounderByID);
router.get("/getStartupsByPage", checkAuthentication, getStartupsByPage);
router.get("/get-startup-enums", getStartupEnums);

export default router;
