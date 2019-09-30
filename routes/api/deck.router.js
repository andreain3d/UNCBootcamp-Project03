const router = require("express").Router();
const deckController = require("../../controllers/deck.controller");

router.route("/").get(deckController.serveUpDeck);
router.route("/shuffle").get(deckController.serveUpShuffledDeck);
router.route("/card").get(deckController.serveUpRandomCard);
router.route("/card/:n").get(deckController.serveUpMultipleCards);
router.route("/new").get(deckController.newServerDeck);
module.exports = router;
