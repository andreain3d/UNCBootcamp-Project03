const router = require("express").Router();
const userRoutes = require("./users.router");
const deckRoutes = require("./deck.router");
const tableRoutes = require("./table.router");
const playerRoutes = require("./player.router");

// User routes
router.use("/users", userRoutes);

// Deck routes
router.use("/deck", deckRoutes);
router.use("/table", tableRoutes);
router.use("/player", playerRoutes);

module.exports = router;
