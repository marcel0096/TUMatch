import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  label: {
    type: String,
  },
  value: {
    type: String,
  },
});

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
