const express = require("express");
const { bankController } = require("../controllers");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.route("/").get(bankController.getAllBank);
router.route("/type/:type").get(bankController.getBankByType);
router.route("/pagination").get(bankController.getBankPagination);
router.route("/export/:initialBalance").get(bankController.getExportExcel);
router.route("/:id").get(bankController.getBank);
router.route("/").post(bankController.createBank);
router
  .route("/import")
  .post(upload.single("file"), bankController.importExcel);
router.route("/:id").put(bankController.updateBank);
router.route("/:id").delete(bankController.deleteBank);

module.exports = router;
