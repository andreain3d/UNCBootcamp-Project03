const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/").get(tableController.serveUpDeck);
router.route("/shuffle").get(tableController.serveUpShuffledDeck);
router.route("/card").get(tableController.serveUpRandomCard);
router.route("/card/:n").get(tableController.serveUpMultipleCards);
router.route("/new").get(tableController.newServerDeck);
module.exports = router;
