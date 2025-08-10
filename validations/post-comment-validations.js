const Joi = require("joi");
const validate = require("../middleware/validate");

// Add Comment
const addCommentsOnAnyPostValidation = validate(
  Joi.object({
    comments: Joi.string().required().label("comments"),
    postID: Joi.number().required().label("postID"),
    userDetailsId: Joi.number().required().label("userDetailsId"),
  }),
  "body"
);

// Get Comments
const getCommentsOnPostValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
  }),
  "params"
);

// Delete Own Post Comments
const deleteOwnPostCommentsValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
    commentsId: Joi.string().required().label("commentsId"),
  }),
  "params"
);

// Edit Own Comment
const editOwnCommentValidation = [
  validate(
    Joi.object({
      userDetailsId: Joi.number().required().label("userDetailsId"),
      postId: Joi.number().required().label("postId"),
      commentsId: Joi.string().required().label("commentsId"),
    }),
    "params"
  ),
  validate(
    Joi.object({
      comments: Joi.string().required().label("comments"),
    }),
    "body"
  ),
];

// Delete Own Comments in Any Post
const deleteOwnCommentsInAnyPostValidation = validate(
  Joi.object({
    userDetailsId: Joi.string().required().label("userDetailsId"),
    commentsId: Joi.string().required().label("commentsId"),
  }),
  "params"
);

module.exports = {
  addCommentsOnAnyPostValidation,
  getCommentsOnPostValidation,
  deleteOwnPostCommentsValidation,
  editOwnCommentValidation,
  deleteOwnCommentsInAnyPostValidation,
};
