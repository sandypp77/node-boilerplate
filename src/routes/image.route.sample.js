const express = require("express");
const { comicbookController } = require("../controllers");

const router = express.Router();
router.route("/image/:fileName").get(comicbookController.getImage);
router.route("/all").get(comicbookController.getAllImages);
router.route("/").post(comicbookController.addImage);
router.route("/:id").put(comicbookController.updateImage);
router.route("/:id").delete(comicbookController.deleteImage);

module.exports = router;
 