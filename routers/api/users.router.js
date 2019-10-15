const router = require("express").Router();
const usersController = require("../../controllers/users.controller");
const path = require("path");
const multer = require("multer");
const moment = require("moment");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../client/public/assets/uploads"),
  filename: (req, file, cb) => {
    cb(
      null,
      `userUpLoad-${moment.now().toString()}${path.extname(file.originalname)}`
    );
  }
});

const upload = multer({
  storage: storage,
  limits: { filesize: 2500000 }
});

router
  .route("/")
  .get(usersController.findAll)
  .post(usersController.create);

router
  .route("/:email")
  .get(usersController.findByEmail)
  .put(usersController.update);

router.post("/upload", upload.single("avatar"), (req, res) => {
  if (req.file) {
    res.json({
      filename: req.file.filename,
      path: path.join(__dirname, "../../client/public/assets/uploads"),
      rel: "/assets/uploads/" + req.file.filename
    });
  } else {
    res.json({ err: "Something went wrong. It's unknowable" });
  }
});

module.exports = router;
