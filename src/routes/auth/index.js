const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");

/**
 * @swagger
 *  tags:
 *      name: UserAuthentication
 *      description: user-auth section
 *
 */

/**
 * @swagger
 *  /auth/get-otp:
 *      post:
 *          tags: [UserAuthentication]
 *          summary:
 *          description:
 *          parameters:
 *          -   name: mobile,
 *              description: fa-IRI phonenumber
 *              in: formData
 *              required: true
 *              type: string
 *          responses:
 *              201:
 *                  description:SUccess
 *              400:
 *                  description: Bad request
 *              401:
 *                  description: Unuthorize
 *              500:
 *                  description:Internal Server Error
 *
 */
router.post(
  "/get-otp",
  // validator.registerValidation(),
  controller.validate,
  controller.getOtp
);

/**
 * @swagger
 *  /auth/check-otp:
 *      post:
 *          tags: [UserAuthentication]
 *          summary:
 *          description:
 *          parameters:
 *          -   name: mobile,
 *              description: fa-IRI phonenumber
 *              in: formData
 *              required: true
 *              type: string
 *          -   name: code,
 *              description: fenter sms code recieve
 *              in: formData
 *              required: true
 *              type: string
 *          responses:
 *              201:
 *                  description:SUccess
 *              400:
 *                  description: Bad request
 *              401:
 *                  description: Unuthorize
 *              500:
 *                  description:Internal Server Error
 *
 */
router.post(
  "/check-otp",
  validator.loginValidation(),
  controller.validate,
  controller.checkOtp
);

router.post("/verifycode", controller.checkVerifyCode);

// router.post(
//   "/login",
//   validator.loginValidation(),
//   controller.validate,
//   controller.login
// );

// router.post("/logout", controller.logout);

// router.post("/token", controller.verifyRefreshToken, controller.GetAccessToken);

module.exports = router;
