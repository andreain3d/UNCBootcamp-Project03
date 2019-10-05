var mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  image: String,
  cash: { type: Number, default: 1000 },
  achievements: { type: Array, default: [] },
  preferences: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
