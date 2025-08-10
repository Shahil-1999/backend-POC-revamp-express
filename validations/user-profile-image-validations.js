const Joi = require("joi");
const validate = require("../middleware/validate");

// Get Profile Image (body validation)
const getProfileImageValidation = validate(
  Joi.object({
    key: Joi.string().required().label("key"),
  }),
  "body"
);

// Upload Profile Image (params validation)
const uploadProfileImageValidation = validate(
  Joi.object({
    filename: Joi.string().required().label("filename"),
  }),
  "params"
);

// Get All Images (params validation)
const getAllImageValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
  }),
  "params"
);

module.exports = {
  getAllImageValidation,
  uploadProfileImageValidation,
  getProfileImageValidation,
};
