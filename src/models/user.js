const mongoose = require("mongoose");
const timestamp = require("mongoose-timestamp");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: false,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Regular expression allowing periods in the email address
  },
  password: { type: String, require: false },
  firstName: { type: String },
  lastName: { type: String },
  address: { type: String },
  sexuality: { type: mongoose.Schema.ObjectId, ref: "Sexuality" },
  // languages: [{ type: mongoose.Schema.ObjectId, ref: "Language" }],
  education: { type: mongoose.Schema.ObjectId, ref: "Education" },
  // country: { type: mongoose.Schema.ObjectId, ref: "Country" },
  title: { type: mongoose.Schema.ObjectId, ref: "Title" },
  mobile: { type: String, required: false },
  birthDate: { type: Date },
  // creatoreId: { type: mongoose.Schema.ObjectId, ref: "User" },
  lastRefreshToken: { type: String },
  confirmedEmail: { type: Boolean },
  otp: {
    type: Object,
    default: {
      code: 0,
      expiresIv: 0,
    },
  },
  roles: { type: [String] },
});
UserSchema.plugin(timestamp);
const User = mongoose.model("User", UserSchema);
module.exports = User;
