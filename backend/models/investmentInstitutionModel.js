import mongoose from "mongoose";

const industriesSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
});

const investorTypeSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
});

const subscriptionSchema = new mongoose.Schema({
  payerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  stripeUserId: {
    type: String,
  },
  subscriptionId: {
    type: String,
  },
});

const investmentInstitutionSchema = new mongoose.Schema({
  companyLogo: {
    data: Buffer,
    imageType: String,
    imageUrl: String,
  },
  companyName: {
    type: String,
    required: true,
  },
  industries: [industriesSchema],
  rangeOfInvestment: {
    type: String,
  },
  websiteURL: {
    type: String,
  },
  investorType: investorTypeSchema,
  employees: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  invitationCode: {
    type: [String],
  },
  slogan: {
    type: String,
  },
  description: {
    type: String,
  },
  subscription: subscriptionSchema,
});

const InvestmentInstitution = mongoose.model(
  "InvestmentInstitution",
  investmentInstitutionSchema
);

export default InvestmentInstitution;
