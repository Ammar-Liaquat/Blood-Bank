const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userRequest",
    },

    name: String,
    bloodgroup: String,
    unitbag: Number,
    hospitalname: String,
    city: String,
    phonenumber: String,

    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification",notificationSchema);