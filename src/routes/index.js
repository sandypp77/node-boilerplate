const express = require("express");
const scheduleRoute = require("./schedule.route");
const accountRoute = require("./account.route");
const cashflowRoute = require("./cashflow.route");
const cashtypeRoute = require("./cashtype.route");
const bankRoute = require("./bank.route");
const banktypeRoute = require("./banktype.route");

const router = express.Router();

router.use("/schedule", scheduleRoute);
router.use("/account", accountRoute);
router.use("/cashflow", cashflowRoute);
router.use("/cashtype", cashtypeRoute);
router.use("/bank", bankRoute);
router.use("/banktype", banktypeRoute)

module.exports = router;
