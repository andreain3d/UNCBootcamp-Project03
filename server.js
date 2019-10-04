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

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/project03");

//asigned listener to a variable
const server = app.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});

//socket setup
let io = socket(server);
let numUsers = 0;

io.on("connection", socket => {
  console.log(`Connection made on socket ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`user ${socket.id} disconnected`);
  });

  socket.on("SEND_MESSAGE", data => {
    io.emit("RECEIVE_MESSAGE", data);
  });

  // socket.on("add user", username => {
  //   if (addedUser) return;

  //   socket.username = username;
  //   ++numUsers;
  //   addedUser = true;
  //   socket.emit("login", {
  //     numUsers: numUsers
  //   });

  //   socket.broadcast.emit("user joined", {
  //     username: socket.username,
  //     numUsers: numUsers
  //   });
  // });

  socket.on("typing", username => {
    socket.broadcast.emit("isTyping", username);
  });
});

export default io;
