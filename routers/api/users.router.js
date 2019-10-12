const router = require("express").Router();
const usersController = require("../../controllers/users.controller");

router
  .route("/")
  .get(usersController.findAll)
  .post(usersController.create);

router
  .route("/:email")
  .get(usersController.findByEmail)
  .put(usersController.update);

module.exports = router;
