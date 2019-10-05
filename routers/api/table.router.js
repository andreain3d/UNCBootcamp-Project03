const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/").get(tableController.flash);
router
  .route("/prime")
  .get(tableController.prime)
  .post(tableController.prime);
router.route("/join").post(tableController.addPlayer);
router.route("/bet/:position/:amount").get(tableController.placeBet);
router.route("/deal").get(tableController.dealCards);
router.route("/flop").get(tableController.doFlop);
router.route("/turn").get(tableController.doTurn);
router.route("/river").get(tableController.doRiver);
router.route("/cards").get(tableController.getTableCards);
router.route("/hands").get(tableController.calculateHands);
router.route("/payout").get(tableController.payout);
router.route("/reset").get(tableController.reset);
router.route("/leave/:name").get(tableController.leaveTable);
module.exports = router;
