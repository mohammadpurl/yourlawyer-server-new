const express = require("express");
const router = express.Router();
const authRouter = require("./auth");
const error = require("./../middlewares/error.js");

router.use("/auth", authRouter);

router.use(error);
module.exports = router;
