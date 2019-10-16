const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/").get(tableController.flash);
router
  .route("/prime")
  .get(tableController.prime)
  .post(tableController.prime);
router.route("/join").post(tableController.addPlayer);
router.route("/bet/:position/:amount").get(tableController.placeBet);
router
  .route("/leave/:name?")
  .get(tableController.leaveTable)
  .post(tableController.leaveTable)
  .delete(tableController.leaveQue);
module.exports = router;
