import {
  findByID,
  deleteByID,
  createOrEditCompany,
  findByEmployeeID,
  getInvitationCode,
  validateInvitation,
  answerInvitation,
  removeEmployeeByID,
} from "../controller/investmentInstitutionController.js";

import checkAuthentication from "../middleware/authMiddleware.js";
import upload from "../middleware/fileMiddleware.js";
import express from "express";

const router = express.Router();

router.get("/byID/:id", checkAuthentication, findByID);
router.get(
  "/getInvitationCode/:companyId",
  checkAuthentication,
  getInvitationCode
);
router.get("/invite/validate", validateInvitation);
router.post("/invite/respond", checkAuthentication, answerInvitation);
router.get("/byEmployeeID/:employeeId", checkAuthentication, findByEmployeeID);
router.delete("/delete/:id", checkAuthentication, deleteByID);
router.post("/addCompanyInfo", upload.none(), createOrEditCompany);
router.post("/removeEmployeeByID", checkAuthentication, removeEmployeeByID);

export default router;
