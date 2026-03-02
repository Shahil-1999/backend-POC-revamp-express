const Posts = require("./post-model");
const UserDetails = require("./userdetail-model");
const Comments = require("./comment-model");
const Files = require("./file-model");
const Subscriptions = require("./subscription-model");
const RefreshToken = require("./refresh-token-model");

const models = {
  Posts,
  UserDetails,
  Comments,
  Files,
  Subscriptions,
  RefreshToken,
};

Object.values(models).forEach(model => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

module.exports = models;
