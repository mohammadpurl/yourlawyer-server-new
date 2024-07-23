require("dotenv").config();

const User = require("./../models/user");

const jwt = require("jsonwebtoken");

async function isLoggined(req, res, next) {
  // const token = req.header("X-auth-token")

  const token = req.headers.authorization.split(" ")[1];
  if (!token) res.status(401).send("access denied");
  try {
    console.log(`token:${token}`);
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;

    req.token = token;

    const user = await User.findById(decoded.sub);

    console.log(user);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Your session is not valid.",
      data: error,
    });
  }
}
async function getRelatedPatient(req, res, next) {
  try {
    const user = req.user;
    console.log(user._id);
    const guardianRelatedPatient = await GuardianToPatient.find({
      guardian: user._id,
    });
    const patientInf = await Patient.find({ user: user._id });
    const doctorRelatedPatient = await PractitionerToPatient.find({
      user: user._id,
    });
    const guardianRelatedPatientList = [];
    const doctorRelatedPatientList = [];
    guardianRelatedPatient?.map((relatedPatient) =>
      guardianRelatedPatientList.push(relatedPatient?.patient)
    );
    doctorRelatedPatient?.map((relatedPatient) =>
      doctorRelatedPatientList.push(relatedPatient?.patient)
    );
    req.gRelatedPatientList = guardianRelatedPatientList;
    req.dRelatedPatientList = doctorRelatedPatientList;

    console.log(
      `guardianRelatedPatientList${JSON.stringify(guardianRelatedPatientList)}`
    );
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "Your session is not valid.",
      data: error,
    });
  }
}

function verifyToken(req, res, next) {
  try {
    // Bearer tokenstring
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userData = decoded;

    req.token = token;

    // varify blacklisted access token.
    redis_client.get("BL_" + decoded.sub.toString(), (err, data) => {
      if (err) throw err;

      if (data === token)
        return res
          .status(401)
          .json({ status: false, message: "blacklisted token." });
      next();
    });
  } catch (error) {
    return res.status(401).json({
      status: false,
      message: "Your session is not valid.",
      data: error,
    });
  }
}

async function verifyRefreshToken(req, res, next) {
  const token = req.body.token;

  if (token === null)
    return res.status(401).json({ status: false, message: "Invalid request." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    req.userData = decoded;

    const user = await User.findById(decoded.sub);
    if (!user || !user.lastRefreshToken)
      return res.status(401).json({
        status: false,
        message: "Invalid request. Token is not in store.",
      });

    if (user.lastRefreshToken != token)
      return res.status(401).json({
        status: false,
        message: "Invalid request. Token is not same in store.",
      });
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "Your session is not valid.",
      data: error,
    });
  }
}

module.exports = {
  isLoggined,
  verifyRefreshToken,
  getRelatedPatient,
};
