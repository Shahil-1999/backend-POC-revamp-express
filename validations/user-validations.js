const Joi = require("joi");
const validate = require("../middleware/validate");

// Get User Details
const getUserDetailValidation = validate(
  Joi.object({
    id: Joi.string().required().label("id"),
  }),
  "params"
);

// Add User
const userAddValidation = validate(
  Joi.object({
    name: Joi.string().required().label("name"),
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .label("email"),
    password: Joi.string().min(8).max(16).required().label("password"),
    phone_number: Joi.string().required().label("phone_number"),
    gender: Joi.string().required().label("gender"),
    role: Joi.string().required().label("role"),
  }),
  "body"
);

// User Login
const userLoginValidation = validate(
  Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .label("email"),
    password: Joi.string().required().label("password"),
  }),
  "body"
);

// Delete User Account
const userAccountDeleteValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
  }),
  "params"
);

// Reset Password
const resetPasswordValidation = [
  validate(
    Joi.object({
      userDetailsId: Joi.number().required().label("userDetailsId"),
      token: Joi.string().required().label("token"),
    }),
    "params"
  ),
  validate(
    Joi.object({
      password: Joi.string().required().label("password"),
    }),
    "body"
  ),
];

// Forget Password
const forgetPasswordValidation = validate(
  Joi.object({
    email: Joi.string().email().required().label("email"),
  }),
  "body"
);

// Get All Users
const getAllUserValidation = validate(
  Joi.object({
    id: Joi.string().required().label("id"),
  }),
  "params"
);

// Renew Subscription
const renewSubscriptionValidation = validate(
  Joi.object({
    email: Joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
      .required()
      .label("email"),
    secretSubscriptionCode: Joi.string().required().label("secretSubscriptionCode"),
  }),
  "body"
);

module.exports = {
  getUserDetailValidation,
  userAddValidation,
  userLoginValidation,
  userAccountDeleteValidation,
  resetPasswordValidation,
  forgetPasswordValidation,
  getAllUserValidation,
  renewSubscriptionValidation,
};
