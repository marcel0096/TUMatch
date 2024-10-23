import Joi from "joi";

const investmentInstitutionValidationSchema = Joi.object({
  _id: Joi.string().allow("", null),
  companyName: Joi.string().min(1).max(100).required(),
  industries: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.array()
          .items(
            Joi.object({
              label: Joi.string().min(1).max(100).required(),
              value: Joi.string().min(1).max(100).required(),
              _id: Joi.string().min(1).max(100).optional(),
            })
          )
          .validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid industry format");
      }
    })
    .allow("", null),

  investorType: Joi.string()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        const { error } = Joi.object({
          label: Joi.string().min(1).max(100).required(),
          value: Joi.string().min(1).max(100).required(),
          _id: Joi.string().min(1).max(100).optional(),
        }).validate(parsed);
        if (error) throw new Error(error);
        return value;
      } catch (err) {
        return helpers.message("Invalid investor type format");
      }
    })
    .allow("", null),

  rangeOfInvestment: Joi.string().max(100).required(),
  websiteURL: Joi.string()
    .pattern(/(.+)\.(.+)/)
    .allow("", null),
  slogan: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(200).allow("", null),
  paid: Joi.boolean().allow("", null),
  employees: Joi.string()
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
  companyLogo: Joi.string()
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

export default investmentInstitutionValidationSchema;
