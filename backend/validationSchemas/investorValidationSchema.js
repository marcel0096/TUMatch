import Joi from "joi";

const investorSchema = Joi.object({
  _id: Joi.string().required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  position: Joi.string().min(1).max(100).required(),
  profession: Joi.string().required(),
  linkedinURL: Joi.string()
    .pattern(/(.+)\.(.+)/)
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

export default investorSchema;
