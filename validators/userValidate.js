const joi = require("joi");

const registerSchema = joi.object({

  email: joi.string()
  .email({tlds: {allow:false}})
  .pattern(/^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/)
  .required(),
  password: joi.string()
  .min(8)
  .required()
})

const passwordSchema = joi.object({
  email: joi.string().email({ tlds: { allow: false } }).required(),
  otp: joi.string().length(4).required(),
  newPassword: joi.string().min(8).required()
});

const profileSchema = joi.object({
  name: joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
    }),

  age: joi.number()
    .integer()
    .min(18)
    .max(65)
    .required()
    .messages({
      "number.base": "Age must be a number",
      "number.min": "Age must be at least 18",
      "number.max": "Age must be less than 65",
    }),

  gender: joi.string()
    .valid("male", "female")
    .required()
    .messages({
      "any.only": "Gender must be male or female",
    }),

  bloodgroup: joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .required()
    .messages({
      "any.only": "Invalid blood group",
    }),

  phonenumber: joi.string()
    .required(),

  address: joi.string()
    .min(5)
    .required()
    .messages({
      "string.empty": "Address is required",
    }),
  unitbag: joi.number()
  .integer()
  .min(0)
  .optional()
  .messages({
    "number.base": "Unit bag must be a number",
    "number.min": "Unit bag cannot be negative",
  }),  
  thalassemia: joi.string()
    
    .valid("yes", "no")
    .required()
    .messages({
      "any.only":
        "Thalassemia must be yes or no",
    }),

  lastDonationDate: joi.date()
    .optional()
    .less("now")
    .messages({
      "date.less":
        "Donation date cannot be in future",
    }),
   longitude: joi.number()
    .required()
    .messages({
      "number.base": "Longitude must be a number",
      "any.required": "Longitude is required",
    }),

  latitude: joi.number()
    .required()
    .messages({
      "number.base": "Latitude must be a number",
      "any.required": "Latitude is required",
    }),
  
});

module.exports = {
    registerSchema,
    passwordSchema,
    profileSchema
}