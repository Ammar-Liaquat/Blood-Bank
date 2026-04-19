const mongoose = require("mongoose");

const requestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userProfile",
    },
    name: {
      type: String,
      required: true,
    },
    bloodgroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    unitbag: {
      type: Number,
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    timelimit: {
      type: Date,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    hospitalname: {
      type: String,
      required: true,
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
    status: {
      type: String,
      enum: ["pending", "accepted", "cancelled", "completed"],
      default: "pending",
    },

    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userProfile",
      default: null,
    },
  },
  { timestamps: true },
);
// Required for near search
requestSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("userRequest", requestSchema);
