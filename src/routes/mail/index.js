const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");
const crypto = require("crypto-js");
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: process.env.USER, //sender email address
    pass: process.env.APP_PASSWORD, //App password from Gmail Account
  },
});

function generateVerificationCode(email) {
  console.log(email);
  const constantCode = process.env.HASH_CODE;
  const verificationCode = crypto.SHA256(email + constantCode).toString();
  console.log(verificationCode);
  return verificationCode;
}
async function sendMail(mailAddress) {
  try {
    console.log(mailAddress);
    const verificationCode = await generateVerificationCode(mailAddress);
    const mailOptions = {
      from: {
        name: "",
        address: process.env.USER,
      },
      to: mailAddress,
      subject: "PatientX Verification Code", // Subject line
      text: `Your verification code is: ${verificationCode}`, // plain text body
    };
    console.log(transporter)
   
    await transporter.sendMail(mailOptions);
    console.log("the mail has been send successfully");
    return verificationCode
  } catch (error) {
    console.log(error);
  }
}
async function sendMailToPractitioners(
  mailAddress,
  patientName,
  doctorName,
  type
) {
  try {
    let html = "";
    if (type === "practitioner") {
      html = `
      <h1>Dear ${doctorName},</h1>
      <p>${patientName} has added you to their health record.</p>
      <p>We invite you to log in and view the health appraisal responses of ${patientName}.</p>
      <p>Thank you for your participation.</p>
      <p>Best regards,</p>
      <p>The PatientX Team</p>
    `;
    }
    else{
      html = `
      <h1>Dear ${doctorName},</h1>
      <p>${patientName} has added you to their health record.</p>
      <p>We invite you to log in and view the health appraisal responses of ${patientName}.</p>
      <p>Thank you for your participation.</p>
      <p>Best regards,</p>
      <p>The PatientX Team</p>
    `;
    }

    console.log(html);
    const mailOptions = {
      from: {
        name: "",
        address: process.env.USER,
      },
      to: mailAddress,
      subject: "PatientX - New Health Record", // Subject line
      html: html,
    };

    await transporter.sendMail(mailOptions);
    console.log("The email has been sent successfully.");
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  sendMail,
  generateVerificationCode,
  sendMailToPractitioners,
};
