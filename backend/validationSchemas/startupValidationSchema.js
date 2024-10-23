import Joi from "joi";

const jobOfferSchema = Joi.object({
  _id: Joi.string().allow("", null),
  shortDescription: Joi.string().min(1).max(100).required(),
  longDescription: Joi.string().allow("", null),
  requiredSkills: Joi.array()
    .items(
      Joi.object({
        label: Joi.string().max(100).required(),
        value: Joi.string().max(100).required(),
        __isNew__: Joi.boolean().optional(),
      })
    )
    .allow("", null),
});

const startupSchema = Joi.object({
  _id: Joi.string().allow("", null),
  startupName: Joi.string().min(1).max(100).required(),
  industry: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.object({
          label: Joi.string().min(1).max(100).required(),
          value: Joi.string().min(1).max(100).required(),
          __isNew__: Joi.boolean().optional(),
        }).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid industry format");
      }
    })
    .allow("", null),
  businessModel: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.object({
          label: Joi.string().min(1).max(100).required(),
          value: Joi.string().min(1).max(100).required(),
        }).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid industry format");
      }
    })
    .allow("", null),
  investmentStage: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.object({
          label: Joi.string().min(1).max(100).required(),
          value: Joi.string().min(1).max(100).required(),
        }).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid industry format");
      }
    })
    .allow("", null),
  requiredResources: Joi.string().max(100).allow("", null),
  websiteURL: Joi.string()
    .pattern(/(.+)\.(.+)/)
    .allow("", null),
  slogan: Joi.string().min(1).max(100).required(),
  shortDescription: Joi.string().max(200).allow("", null),
  longDescription: Joi.string().allow("", null),
  coFounders: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array().items(Joi.string()).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid coFounders format");
      }
    })
    .required(),
  jobOffers: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array().items(jobOfferSchema).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid jobOffers format");
      }
    })
    .allow("", null),
  startupLogo: Joi.string()
    .allow("", null)
    .custom((value, helpers) => {
      const base64Pattern =
        /^data:image\/(jpeg|png|jpg);base64,[A-Za-z0-9+/=]+$/;

      if (value && !base64Pattern.test(value)) {
        return helpers.message("Invalid startup logo format");
      }

      // Check if the size is larger than 5MB
      const base64Data = value.split(",")[1];
      const sizeInMB = Buffer.byteLength(base64Data, "base64") / (1024 * 1024);
      if (sizeInMB > 5) {
        return helpers.message("Startup logo must not exceed 5MB");
      }

      return value;
    }),
});

export default startupSchema;
