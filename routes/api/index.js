const router = require("express").Router();
const cardRoutes = require("./deck.router");

// Book routes
router.use("/deck", cardRoutes);

module.exports = router;
