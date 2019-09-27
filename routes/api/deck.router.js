const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/").get(tableController.serveUpDeck);
router.route("/shuffle").get(tableController.serveUpShuffledDeck);
router.route("/card").get(tableController.serveUpRandomCard);

module.exports = router;
