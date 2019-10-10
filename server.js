const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routers");
const PORT = process.env.PORT || 3001;
const app = express();
const socket = require("socket.io");

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// Define API routes here
app.use(routes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://admin:password1@ds333098.mlab.com:33098/heroku_jr3hf4cw");

//asigned listener to a variable
const server = app.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});

//socket setup
let io = socket(server);

io.on("connection", socket => {
  console.log(`Connection made on socket ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
    const { check } = require("./controllers/table.controller");
    check(socket.id);
  });

  socket.on("SEND_MESSAGE", data => {
    io.emit("RECEIVE_MESSAGE", data);
  });
});

export default io;
