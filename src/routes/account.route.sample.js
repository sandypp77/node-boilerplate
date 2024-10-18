const express = require("express");
const { accountController } = require("../controllers");

const router = express.Router();

router.route("/").get(accountController.getAllAccounts);
router.route("/pagination").get(accountController.getAccountPagination);
router.route("/").post(accountController.createAccount);
router.route("/:id").put(accountController.updateAccount);
router.route("/:id").delete(accountController.deleteAccount);

module.exports = router;
