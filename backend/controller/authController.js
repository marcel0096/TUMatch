import bcrypt from "bcryptjs";
import crypto from "crypto";
import config from "../config.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { handleCheckHasPaid } from "./paymentController.js";
import { generateAndSendVerificationEmail } from "../utils.js";

const register = async (req, res) => {
  try {
    const { email, password, profession } = req.body;

    if (!email || !password)
      return res.status(400).send("Email and password are required");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      profession,
    });
    //perform login after signup
    const token = jwt.sign({ id: user._id }, config.TOKEN_KEY, {
      expiresIn: 3 * 24 * 60 * 60,
    });
    res.cookie("token", token, {
      httpOnly: true,
    });
    const hasPaid = await handleCheckHasPaid(user._id);
    if (hasPaid === null || hasPaid === undefined) {
      return res.status(500).json({
        error: "Internal server error",
        message:
          "Stripe error or backend error - in handleCheckHasPaid in paymentController.js",
      });
    }
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      userId: user._id,
      profession: user.profession,
      validSubscription: hasPaid,
      verifiedEmail: user.verified,
    });
  } catch (err) {
    if (err.code == 11000) {
      return res.status(400).json({
        err: "User already exists",
        message: err.message,
      });
    } else {
      return res.status(500).json({
        err: "Internal server error",
        message: err.message,
      });
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).send("Email and password are required");
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).send("User not found");
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).send("Incorrect password");
    const token = jwt.sign({ id: user._id }, config.TOKEN_KEY, {
      expiresIn: 3 * 24 * 60 * 60,
    });
    res.cookie("token", token, {
      httpOnly: true,
    });
    const hasPaid = await handleCheckHasPaid(user._id);
    if (hasPaid === null || hasPaid === undefined) {
      return res.status(500).json({
        error: "Internal server error",
        message:
          "Stripe error or backend error - in handleCheckHasPaid in paymentController.js",
      });
    }
    res.status(200).json({
      message: "User logged in successfully",
      success: true,
      userId: user._id,
      profession: user.profession,
      validSubscription: hasPaid,
      verifiedEmail: user.verified,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: err,
      message: "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).send("Logged out");
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(404).json({
        error: "Not Found",
        message: `User not found`,
      });
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};

// used for email verification
const generateVerificationToken = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const token = crypto.randomBytes(20).toString("hex");
    const verificationLink = `http://localhost:3000/verify-email?token=${token}`;

    // add the token to the user in the database
    await User.findByIdAndUpdate(userId, {
      $set: { verificationToken: token },
    });
    await generateAndSendVerificationEmail(user.email, verificationLink);
    return res.status(200).json({ message: "Verification email sent" });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error during creation of email token",
      message: err.message,
    });
  }
};

// used for email verification
const verifyVerificationToken = async (req, res) => {
  try {
    console.log("verifyVerificationToken");
    const { token, userId } = req.body;
    console.log("verify token: ", token, " from user with id: ", userId);
    if (!token) return res.status(400).json({ message: "Token is required" });
    if (!userId)
      return res.status(400).json({ message: "User ID is required" });

    const user = await User.findById(userId);
    console.log("User in verifyVerificationToken: ", user);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verificationToken === token) {
      console.log("Token is valid");
      user.verified = true;
      user.verificationToken = undefined;
      await user.save();
      console.log("user updated");
      return res
        .status(200)
        .json({ message: "Email verified successfully", verified: true });
    } else
      return res
        .status(400)
        .json({ message: "Token is invalid", verified: false });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error during verification of email token",
      message: err.message,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Invalid input data" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "Invalid input data" });

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword)
      return res.status(400).json({ message: "Invalid input data" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.userId, {
      $set: { password: hashedPassword },
    });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error during password change",
      message: err.message,
    });
  }
};

export {
  login,
  register,
  logout,
  me,
  generateVerificationToken,
  verifyVerificationToken,
  changePassword,
};
