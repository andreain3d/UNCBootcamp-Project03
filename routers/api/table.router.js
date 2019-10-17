const router = require("express").Router();
const tableController = require("../../controllers/table.controller");

router.route("/join").post(tableController.addPlayer);
router.route("/bet/:position/:amount").get(tableController.placeBet);
router.route("/leave").post(tableController.leaveTable);
router.route("/leave/:name").delete(tableController.leaveQue);
module.exports = router;
