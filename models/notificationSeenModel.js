const mongoose = require("mongoose");
const notificationSeenSchema = mongoose.Schema(
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userProfile",
    required: true
  },

  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
    required: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

},
{ timestamps: true }
);

module.exports = mongoose.model(
  "NotificationSeen",
  notificationSeenSchema
);