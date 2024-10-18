const express = require("express");
const { banktypeController } = require("../controllers");

const router = express.Router();

router.route("/").get(banktypeController.getAllBankType);
router.route("/").post(banktypeController.createBanktype);
router.route("/:id").put(banktypeController.updateBanktype);
router.route("/:id").delete(banktypeController.deleteBanktype);

module.exports = router;
