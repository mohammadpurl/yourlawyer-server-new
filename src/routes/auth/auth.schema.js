const joi = require("@hapi/joi");
const getOtpSchema = joi.object({
  mobile: joi
    .string()
    .length(11)
    // .pattern("^09[0-9]{9}$")
    .error(new Error("لطفا شماره موبایل را به درستی وارد کنید")),
});

const checkOtpSchema = joi.object({
  mobile: joi
    .string()
    .length(11)
    // .pattern("^09[0-9]{9}$")
    .error(new Error("لطفا شماره موبایل را به درستی وارد کنید")),
  code: joi
    .number()
    .min(4)
    .max(6)
    .error(new Error("کد ارسال شده صحیح نمی باشد")),
});
module.exports = {
  getOtpSchema,
  checkOtpSchema,
};
