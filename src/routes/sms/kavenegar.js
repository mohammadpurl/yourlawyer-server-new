const Kavenegar = require("kavenegar");
require("dotenv").config();
async function sendSMS(mobile, code) {
  console.log("SMS", code);
  var api = Kavenegar.KavenegarApi({
    apikey: process.env.KAVEH_NEGAR_API_KEY,
  });
  console.log(process.env.KAVEH_NEGAR_API_KEY);
  const result = api.Send(
    {
      message: `کد احراز هویت:${code}
وکیل تو`,
      sender: process.env.SMS_SENDER_NUMBER,
      receptor: mobile,
    },
    function (response, status) {
      console.log(response);
      console.log("status", status);
    }
  );
  console.log(result);
}

module.exports = {
  sendSMS,
};
