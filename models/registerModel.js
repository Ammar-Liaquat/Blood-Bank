const mongoose = require("mongoose");

const registerUserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
    },
    isSocial: {
      type:Boolean,
      default:false
    },
    otpExpiry: Number,
    isVerify: {
      type: Boolean,
      default: false,
    },
    refreshtoken: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("registerUser", registerUserSchema);
