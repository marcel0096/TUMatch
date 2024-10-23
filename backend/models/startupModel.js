import mongoose from "mongoose";

// Seperate schema for the job offers inside a startup
const jobOffersSchema = new mongoose.Schema({
  shortDescription: {
    type: String,
  },
  longDescription: {
    type: String,
  },
  requiredSkills: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
  },
});

const startupSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to current time upon creation
  },
  startupLogo: {
    data: Buffer,
    imageType: String,
    imageUrl: String,
  },
  startupName: {
    type: String,
    required: true,
  },
  industry: {
    label: String,
    value: String,
  },
  businessModel: {
    label: String,
    value: String,
  },
  investmentStage: {
    label: String,
    value: String,
  },
  requiredResources: {
    type: String,
  },
  websiteURL: {
    type: String,
  },
  coFounders: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  invitationCode: {
    type: [String],
  },
  slogan: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  longDescription: {
    type: String,
  },
  jobOffers: [jobOffersSchema],
});

const Startup = mongoose.model("Startup", startupSchema);

export default Startup;
