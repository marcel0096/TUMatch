import ResetPassword from "../models/resetPasswordModel.js";
import User from "../models/userModel.js";
import { generateAndSendResetPasswordEmail } from "../utils.js";
import bcrypt from "bcryptjs";

const newResetPassword = async (req, res) => {
  try {
    let email = req.body.email;
    let user = await User.findOne({ email: email });
    if (!user) {
      //also return success message to prevent email enumeration
      return res.status(200).json({
        message:
          "If an account with that email exists, a password reset link has been sent to your email.",
      });
    }

    //delete any existing reset password documents for the user
    await ResetPassword.deleteMany({ userEmail: user.email });

    let resetPassword = new ResetPassword({
      userEmail: user.email,
    });

    resetPassword = await resetPassword.save();

    let resetPasswordLink = `http://localhost:3000/reset-password?id=${resetPassword._id}`;

    generateAndSendResetPasswordEmail(email, resetPasswordLink);

    res.status(200).json({
      message:
        "If an account with that email exists, a password reset link has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validateResetPassword = async (req, res) => {
  try {
    let { id, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    let resetPassword = await ResetPassword.findById(id);

    if (!resetPassword) {
      return res.status(404).json({ message: "Invalid reset password link." });
    }

    if (resetPassword.expiryDate < new Date()) {
      return res
        .status(400)
        .json({ message: "Reset password link has expired." });
    }

    //delete the reset password document from the database on successful reset
    let user = await User.findOne({ email: resetPassword.userEmail });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid reset password link (User)." });
    }

    //hash the password and save it to the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword },
    });

    await ResetPassword.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Reset password was successful." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { newResetPassword, validateResetPassword };
