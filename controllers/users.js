const User = require("../models/registerModel");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { accessToken, refreshToken, verifyToken } = require("../utils/token");
const otpGenerate = require("../utils/otpGenerate");
const mailer = require("../utils/nodeMailer");

const createUsers = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user)
      return res.status(409).json({
        code: 409,
        message: "User Already Exist",
      });
    const hashed = await hashPassword(password, 12);
    const otp = otpGenerate();

    user = await User.create({
      email,
      password: hashed,
      otp,
      isVerify: false,
      otpExpiry: Date.now() + 5 * 60 * 1000,
    });
    await mailer(email, otp);
    res.status(200).json({
      message: `otp is send to your email expire in 5 mint plz verify`,
      code: 200,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "internal server error",
      error: error.message,
    });
  }
};
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    let user = await User.findOne({ email });
    if (user.isVerify)
      return res.status(409).json({
        message: "user already verified ",
      });
    if (otp != user.otp)
      return res.status(401).json({
        message: "invalid otp",
        code: 401,
      });

    if (!otp || user.otpExpiry < Date.now())
      return res.status(410).json({
        message: "expired otp",
        code: 410,
      });
    const refreshtoken = await refreshToken(user);
    user.refreshtoken = refreshtoken;
    user.otp = null;
    user.isVerify = true;
    user.otpExpiry = null;
    await user.save();

    res.status(201).json({
      message: "signup successfully",
      code: 201,
    });
  } catch (err) {
    res.status(500).json({
      message: "internal server error",
      code: 500,
      error: err.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email });

    if (user.isVerify === true) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({
        message: "User Already Verifed",
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = otpGenerate();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    await user.save();
    await mailer(email, otp);
    res.status(200).json({
      message: `OTP has been resent to your email. Please verify it. It will expire in 5 minutes.`,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      code: 500,
      error: error.message,
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        code: 404,
        message: "User Not Found",
      });

    const compare = await comparePassword(password, user.password);
    if (!compare)
      return res.status(401).json({
        code: 401,
        message: "Wrong Password",
      });
    const token = await accessToken(user);
    const refreshtoken = await refreshToken(user);
    user.refreshtoken = refreshtoken;
    await user.save();
    res.status(200).json({
      code: 200,
      message: "Login Successfully",
      email,
      token,
      refreshtoken,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = otpGenerate();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 min
    await user.save();

    await mailer(email, otp); // send email
    res.status(200).json({
      code: 200,
      message:
        "OTP has been resent to your email. Please verify it. It will expire in 5 minutes.",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp)
      return res.status(401).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now())
      return res.status(410).json({
        code: 410,
        message: "OTP expired",
      });

    const hashed = await hashPassword(newPassword, 12);
    user.password = hashed;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};
const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // Refresh token remove
    user.refreshtoken = null;
    await user.save();

    res.status(200).json({
      code: 200,
      message: "Logout Successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshtoken } = req.body;

    if (!refreshtoken) {
      return res.status(401).json({
        code: 401,
        message: "Refresh token required",
      });
    }

    // Find user with refresh token
    const user = await User.findOne({
      refreshtoken,
    });

    if (!user) {
      return res.status(403).json({
        code: 403,
        message: "Invalid refresh token",
      });
    }

    // Verify refresh token
    const decoded = await verifyToken(refreshtoken, "refresh");

    if (!decoded) {
      return res.status(403).json({
        code: 403,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const newAccessToken = await accessToken(user);

    res.status(200).json({
      code: 200,
      message: "New access token generated",
      accesstoken: newAccessToken,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createUsers,
  verifyOtp,
  resendOtp,
  userLogin,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshAccessToken,
};
