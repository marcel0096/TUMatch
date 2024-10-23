import Joi from "joi";

// Calculate the date 100 years ago from now
const date100YearsAgo = new Date();
date100YearsAgo.setFullYear(date100YearsAgo.getFullYear() - 100);

const studyProgramSchema = Joi.object({
  _id: Joi.string().allow("", null),
  university: Joi.string().min(1).max(100).required(),
  program: Joi.object({
    label: Joi.string().min(1).max(100).required(),
    value: Joi.string().min(1).max(100).required(),
  }).required(),
  level: Joi.object({
    label: Joi.string().min(1).max(100).required(),
    value: Joi.string().min(1).max(100).required(),
  }).required(),
  startDate: Joi.date().iso().max("now").min(date100YearsAgo).required(),
  endDate: Joi.date()
    .iso()
    .max("now")
    .min(Joi.ref("startDate"))
    .allow("", null),
});

const jobPositionSchema = Joi.object({
  _id: Joi.string().allow("", null),
  company: Joi.string().min(1).max(100).required(),
  title: Joi.string().min(1).max(100).required(),
  startDate: Joi.date().iso().max("now").min(date100YearsAgo).required(),
  endDate: Joi.date()
    .iso()
    .max("now")
    .min(Joi.ref("startDate"))
    .allow("", null),
  description: Joi.string().max(200).allow("", null),
});

const extraCurricularPositionSchema = Joi.object({
  _id: Joi.string().allow("", null),
  organization: Joi.string().min(1).max(100).required(),
  position: Joi.string().min(1).max(100).required(),
  startDate: Joi.date().iso().max("now").min(date100YearsAgo).required(),
  endDate: Joi.date()
    .iso()
    .max("now")
    .min(Joi.ref("startDate"))
    .allow("", null),
  description: Joi.string().max(200).allow("", null),
});

const userSchema = Joi.object({
  _id: Joi.string().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  dateOfBirth: Joi.date().iso().max("now").min(date100YearsAgo).required(),
  selfDescription: Joi.string().max(200).allow("", null),
  linkedinURL: Joi.string()
    .pattern(/(.+)\.(.+)/)
    .allow("", null),
  studyPrograms: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array()
          .items(studyProgramSchema)
          .validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid studyPrograms format");
      }
    })
    .allow("", null),
  jobPositions: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array().items(jobPositionSchema).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid jobPositions format");
      }
    })
    .allow("", null),
  extraCurricularPositions: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array()
          .items(extraCurricularPositionSchema)
          .validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid extraCurricularPositions format");
      }
    })
    .allow("", null),
  skills: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array()
          .items(
            Joi.object({
              label: Joi.string().min(1).max(100).required(),
              value: Joi.string().min(1).max(100).required(),
              __isNew__: Joi.boolean().optional(),
            })
          )
          .validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid skills format");
      }
    })
    .allow("", null),
  profilePictureUrl: Joi.string()
    .allow("", null)
    .custom((value, helpers) => {
      const base64Pattern =
        /^data:image\/(jpeg|png|jpg);base64,[A-Za-z0-9+/=]+$/;

      if (value && !base64Pattern.test(value)) {
        return helpers.message("Invalid profile picture format");
      }

      // Check if the size is larger than 5MB
      const base64Data = value.split(",")[1];
      const sizeInMB = Buffer.byteLength(base64Data, "base64") / (1024 * 1024);
      if (sizeInMB > 5) {
        return helpers.message("Profile picture must not exceed 5MB");
      }

      return value;
    }),
});

export default userSchema;
