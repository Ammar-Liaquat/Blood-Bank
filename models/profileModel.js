const mongoose = require("mongoose");
const profileSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "registerUser",
    },
    avatar: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    bloodgroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    thalassemia: {
      type: String,
      enum: ["yes", "no"],
      required: true,
    },
    unitbag: {
      type: Number,
      required: false,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bloodDonated: {
      type: Boolean,
      default: false,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    lifeSaved: {
      type: Number,
      default: 0,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);
profileSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("userProfile", profileSchema);
