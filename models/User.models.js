var mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    userName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    achievements: {
      type: Array,
      default: []
    },
    preferences: {
      type: String,
      default: ""
    }
  })
);

module.exports = User;
