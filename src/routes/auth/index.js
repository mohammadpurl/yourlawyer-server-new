const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");

router.post(
  "/get-otp",
  // validator.registerValidation(),
  controller.validate,
  controller.getOtp
);

router.post(
  "/check-otp",
  validator.loginValidation(),
  controller.validate,
  controller.checkOtp
);

router.post("/verifycode", controller.checkVerifyCode);

module.exports = router;
