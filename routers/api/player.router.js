const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/:position/cards").get(tableController.getPlayerCards);

module.exports = router;
