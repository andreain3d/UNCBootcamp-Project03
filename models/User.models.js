var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  image: String,
  achievements: String,
  preferences: String
});

const User = mongoose.model("User", userSchema);

module.exports = User;
