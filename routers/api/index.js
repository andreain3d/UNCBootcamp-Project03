const router = require("express").Router();
const deckRoutes = require("./deck.router");
const tableRoutes = require("./table.router");
const playerRoutes = require("./player.router");

// Deck routes
router.use("/deck", deckRoutes);
router.use("/table", tableRoutes);
router.use("/player", playerRoutes);

module.exports = router;
