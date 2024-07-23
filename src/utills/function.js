const createHttpError = require("http-errors");
const User = require("../models/user");

const JWT = require("jsonwebtoken");
function RandomNumberGenerator() {
  return Math.floor(Math.random() * 90000 + 10000);
}

function SignAccessToken(userId) {
  return new Promise(async (resolve, reject) => {
    const user = await User.findById(userId).then();
    const payload = {
      mobile: user.mobile,
      useID: user._id,
    };
    const secret = "";
    const options = {
      expiresIn: "1h",
    };
    JWT.sign(payload, process.env.JWT_ACCESS_SECRET, options, (err, token) => {
      if (err)
        reject(createHttpError.InternalServerError("something went wrong"));
      resolve(token);
    });
  });
}
function VerifyAccessToken(token) {
  JWT.verify(token, process.env);
}

module.exports = {
  RandomNumberGenerator,
  SignAccessToken,
  VerifyAccessToken,
};
