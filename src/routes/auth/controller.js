const controller = require("./../controller");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// const email = require("./../mail");
const {
  RandomNumberGenerator,
  SignAccessToken,
} = require("../../utills/function");
const { EXPIRES_IN, USERS_ROLES } = require("../../utills/constans");
const createHttpError = require("http-errors");
const { checkOtpSchema } = require("./auth.schema");
const { sendSMS } = require("../sms/Kavenegar");
require("dotenv").config();
// const redis_client = require('./../../../redis_connect');

module.exports = new (class extends controller {
  async register(req, res, next) {
    let user = await this.User.findOne({ email: req.body.email });

    if (user) {
      return this.response({
        res,
        code: 400,
        message: "this user already register",
      });
    }
    user = new this.User({
      email: req.body.email,
      password: req.body.password,
      isDoctor: req.body.isDoctor,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    const response = await user.save();
    console.log(response);

    const verificationCode = await email.sendMail(user.email);
    this.response({
      res,
      message: "the user successfully registered",
      data: {
        _id: user._id,
        email: user.email,
        code: verificationCode,
      },
    });

    // res.redirect(307, "/api/auth//login");
  }
  // *********************check verification code**********************
  async checkVerifyCode(req, res) {
    try {
      const { mobile } = req.body;
      const code = randomNumberGenerator();
      let user = await this.User.findOne({ mobile: mobile });
      console.log(user);
      if (user) {
        const verifyCode = await email.generateVerificationCode(req.body.email);
        console.log(verifyCode);
        console.log(req.body.verifyCode);

        if (verifyCode === req.body.verifyCode) {
          const result = await this.User.findOneAndUpdate(
            { _id: user._id },
            { $set: { confirmedEmail: true } }
          );

          res.redirect(307, "/api/auth//login");
        } else {
          this.response({
            res,
            message: "There was a problem with the code",
            data: _.pick(user, ["_id", "email"]),
          });
        }
      } else {
        return res.status(400).json({
          status: false,
          message: "usr not found",
          data: {},
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: false,
        message: "something went wrong",
        data: error,
      });
    }
  }
  // *********************getOtp**********************
  async getOtp(req, res) {
    try {
      const { mobile } = req.body;
      console.log(mobile);
      const code = RandomNumberGenerator();
      console.log("codellllllllllllllllllllllllllllllll");
      const result = await this.saveUser(mobile, code);
      // if (!result)
      //   throw createHttpError.BadRequest("مشکلی در ورود ایجاد شده است");
      const isSend = sendSMS(mobile, code);
      this.response({
        res,
        message: "کد اعتبار سنجی با موفقیت برای شما ارسال شد",
        data: { code, result },
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ status: true, message: "something went wrong", data: error });
    }
  }
  // *********************check otp**********************
  async checkOtp(req, res, next) {
    try {
      // await checkOtpSchema.validateAsync(req.body);
      console.log("++++++++++++++++++++++++");
      const { mobile, code } = req.body;
      console.log(`mobile: ${mobile} code:${code}`);
      const user = await this.User.findOne({ mobile: mobile });
      console.log(user?.otp?.code);
      if (!user) {
        console.log("!user");
        this.response({
          res,
          message: "کاربر یافت نشد",
          status: 500,
        });
      }

      if (user?.otp?.code != code) {
        this.response({
          res,
          message: "کد ارسال شده صحیح نمی باشد",
          status: 500,
        });
        throw createHttpError.Unauthorized("کد ارسال شده صحیح نمی باشد");
      }

      if (user?.otp?.expiresIn < Date.now()) {
        this.response({
          res,
          message: "کد شما منقضی شده است",
          status: 500,
        });
        throw createHttpError.Unauthorized("کد شما منقضی شده است");
      }

      const accessToken = await SignAccessToken(user?._id);
      this.response({
        res,
        message: "successfuly loged in",
        data: { accessToken },
      });
    } catch (error) {
      // next(error);
      console.log(error);
    }
  }
  // *********************saveUser**********************

  async saveUser(mobile, code) {
    const result = await this.checkExitUser(mobile);
    console.log("checkExitUser", result);
    let otp = {
      code,
      expiresIn: EXPIRES_IN,
    };
    console.log(otp);
    if (result) {
      return await this.updateUser(mobile, { otp });
    }
    const user = await this.User.create({
      mobile: mobile,
      otp,
      roles: [USERS_ROLES],
    });
    console.log(user);
    return !!user;
  }
  // *********************checkExitUser**********************
  async checkExitUser(mobile) {
    const user = await this.User.findOne({ mobile: mobile });
    return !!user;
  }
  // *********************updateUser**********************
  async updateUser(mobile, objectData = {}) {
    Object.keys(objectData).forEach((key) => {
      if (["", " ", 0, null, NaN, undefined, "0"].includes(objectData[key]))
        delete objectData[key];
    });
    const updateResult = await this.User.updateOne(
      { mobile },
      { $set: objectData }
    );
    return !!updateResult.modifiedCount;
  }
  // *********************login**********************
  async getRoles(user) {
    try {
      const isDoctor = user.isDoctor && user.conformIsDoctor;
      const guardianRelatedPatient = await GuardianToPatient.find({
        guardian: user._id,
      });
      const isGuardian = guardianRelatedPatient.length > 0;
      const patientInf = await Patient.find({ user: user._id });
      const isPatient = patientInf.length > 0;

      const userRole = {
        isAdmin: user.isadmin,
        isDoctor,
        isPatient,
        isGuardian,
      };

      console.log(`getRoles userRole ${JSON.stringify(userRole)}`);
      return userRole;
    } catch (error) {
      console.error(`getRoles error ${error}`);
      throw error;
    }
  }

  // *********************login**********************
  async logout(req, res) {
    const token = req.headers.authorization.split(" ")[1];
    console.log(`logout:${req.headers.authorization}`);
    if (!token) res.status(401).send("access denied");
    try {
      console.log(`token:${token}`);

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.userData = decoded;
      const result = await this.User.findOneAndUpdate(
        { _id: decoded.sub },
        { $set: { lastRefreshToken: "" } }
      );

      return res.json({ status: true, message: "success." });
    } catch (error) {
      return res.status(401).json({
        status: true,
        message: "Your session is not valid.",
        data: error,
      });
    }
  }
  async GetAccessToken(req, res) {
    try {
      const user_id = req.userData.sub;

      const access_token = jwt.sign(
        { sub: user_id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TIME }
      );
      console.log(`GetAccessToken${access_token}`);
      const refresh_token = await this.GenerateRefreshToken(user_id);
      console.log(`GetAccessToken${refresh_token}`);
      return res.json({
        status: true,
        message: "success",
        data: { access_token, refresh_token },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async GenerateRefreshToken(user_id) {
    try {
      const refresh_token = jwt.sign(
        { sub: user_id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_TIME }
      );

      const result = await this.User.findOneAndUpdate(
        { _id: user_id },
        { $set: { lastRefreshToken: refresh_token } }
      );

      return refresh_token;
    } catch (error) {
      console.log(error);
    }
  }

  async verifyRefreshToken(req, res, next) {
    try {
      const token = req.body.token;
      if (token === null)
        return res
          .status(401)
          .json({ status: false, message: "Invalid request." });
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      req.userData = decoded;
      console.log(`decoded${decoded.sub}`);

      const user = await this.User.findById(decoded.sub);
      console.log(`lmp verifyRefreshToken user${user}`);
      if (!user || !user.lastRefreshToken) {
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not in store.",
        });
      }

      if (user.lastRefreshToken != token) {
        console.log("user.lastRefreshToken != token");
        return res.status(401).json({
          status: false,
          message: "Invalid request. Token is not same in store.",
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        status: false,
        message: "Your session is not valid.Relogin now",
        data: error,
      });
    }
  }
})();
