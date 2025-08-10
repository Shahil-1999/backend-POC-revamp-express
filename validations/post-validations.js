const Joi = require("joi");
const validate = require("../middleware/validate");

// Add Post
const addPostValidation = validate(
  Joi.object({
    title: Joi.string().required().label("title"),
    post_description: Joi.string().required().label("post_description"),
    userDetailsId: Joi.number().required().label("userDetailsId"),
  }),
  "body"
);

// Get All Posts
const getAllPostValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
  }),
  "params"
);

// Delete Post
const postDeleteValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
    postId: Joi.string().required().label("postId"),
  }),
  "params"
);

// Get Own Posts
const getOwnPostValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
  }),
  "params"
);

// Edit Post
const editpostValidation = [
  validate(
    Joi.object({
      userDetailsId: Joi.number().required().label("userDetailsId"),
      postId: Joi.string().required().label("postId"),
    }),
    "params"
  ),
  validate(
    Joi.object({
      title: Joi.string().optional().label("title"),
      post_description: Joi.string().optional().label("post_description"),
    }),
    "body"
  ),
];

module.exports = {
  addPostValidation,
  postDeleteValidation,
  getOwnPostValidation,
  editpostValidation,
  getAllPostValidation,
};
