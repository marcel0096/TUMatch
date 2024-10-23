import mongoose from "mongoose";

const resetPasswordSchema = new mongoose.Schema({
  userEmail: {
    type: "string",
  },

  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
});

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

export default ResetPassword;
