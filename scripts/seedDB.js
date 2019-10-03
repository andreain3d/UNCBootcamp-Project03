const mongoose = require("mongoose");
const db = require("../models");

// This file empties the Books collection and inserts the books below

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/project03");

const userSeed = [
  {
    username: "Test1",
    email: "Test1@test.com",
    image: "TestingIMG",
    achievements: "",
    preferences: "String"
  },
  {
    username: "Test2",
    email: "Test2@test.com",
    image: "TestingIMG",
    achievements: "",
    preferences: "String"
  }
];

db.User.remove({})
  .then(() => db.User.collection.insertMany(userSeed))
  .then(data => {
    console.log(data.result.n + " records inserted!");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
