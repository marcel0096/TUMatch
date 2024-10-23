import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Schema for job history
const jobPositionsSchema = new mongoose.Schema({
  company: {
    type: String,
  },
  title: {
    type: String,
  },
  description: String,
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const extraCurricularPositionsSchema = new mongoose.Schema({
  organization: {
    type: String,
  },
  position: {
    type: String,
  },
  description: String,
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

// Schema for study history
const studyProgramsSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true,
  },
  level: {
    label: String,
    value: String,
  },
  program: {
    label: String,
    value: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
});

const skillsSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
});

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true, // check if this throws a reasonable error message if not unique
    trim: true, // replace with a check for spaces -> give reasonable error message
    validate: {
      validator: (value) => {
        return /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
      },
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  profilePicture: {
    data: Buffer,
    imageType: String,
    imageUrl: String,
  },
  profession: {
    type: String,
    required: true,
    enum: ["student", "investor", "admin"],
  },
  position: {
    type: String,
  },
  linkedinURL: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
  },
  selfDescription: {
    type: String,
  },
  jobPositions: [jobPositionsSchema], // Embed job history as an array of subdocuments
  extraCurricularPositions: [extraCurricularPositionsSchema],
  studyPrograms: [studyProgramsSchema], // Embed study history as an array of subdocuments
  skills: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(8);
    this.password = bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.methods.toJSON = function () {
  //if we send the user object to the client, we don't want to send the password
  var obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model("User", userSchema);

export default User;
