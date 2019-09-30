const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/:shuffle?").get(tableController.serveUpDeck);

module.exports = router;
