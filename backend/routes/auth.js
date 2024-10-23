import {
  register,
  login,
  logout,
  me,
  generateVerificationToken,
  verifyVerificationToken,
  changePassword,
} from "../controller/authController.js";
import {
  newResetPassword,
  validateResetPassword,
} from "../controller/resetPasswordController.js";
import checkAuthentication from "../middleware/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/register", register);
router.post(
  "/send-verification-email",
  checkAuthentication,
  generateVerificationToken
);
router.post("/verify-email", checkAuthentication, verifyVerificationToken);
router.post("/login", login);
router.get("/logout", checkAuthentication, logout);
router.get("/me", checkAuthentication, me);
router.post("/change-password", checkAuthentication, changePassword);
router.post("/forgot-password", newResetPassword);
router.post("/validate-reset-password", validateResetPassword);

export default router;
