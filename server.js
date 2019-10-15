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

mongoose.connect(process.env.MONGODB_URI || "mongodb://admin-user:password1@ds333248.mlab.com:33248/heroku_n82s3tgn", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//asigned listener to a variable
const server = app.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});

//socket setup
let io = socket(server);

io.on("connection", socket => {
  console.log("connection made on " + socket.id);
  require("./controllers/table.controller").init();
  socket.on("disconnect", id => {
    console.log("disconnect by " + id);
    const { check } = require("./controllers/table.controller");
    check(socket.id);
  });

  socket.on("SEND_MESSAGE", data => {
    io.emit("RECEIVE_MESSAGE", data);
  });
});

module.exports = io;
