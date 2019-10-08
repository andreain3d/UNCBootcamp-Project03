import axios from "axios";

export default {
  // Gets all users
  getUsers: function() {
    return axios.get("/api/users");
  },
  // Gets the book with the given id
  getUser: function(email) {
    return axios.get("/api/users/" + email);
  },
  // Saves a book to the database
  saveUser: function(userData) {
    return axios.post("/api/users", userData);
  },
  createPlayer: function(playerData) {
    return axios.post("/api/table/join", playerData);
  },
  leaveQueue: function(name) {
    return axios.delete("/api/table/leave/" + name);
  },
  leaveTable: function(name) {
    return axios.get("/api/table/leave/" + name);
  }
};
