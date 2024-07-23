const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const error = require("./../middlewares/error.js");
const { isLoggined, getRelatedPatient } = require("./../middlewares/auth.js");
router.use("/auth", authRouter);

router.use(error);
module.exports = router;
