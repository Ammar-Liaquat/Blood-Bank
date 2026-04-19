const userRequest = require("../models/requestModel");
const userProfile = require("../models/profileModel");
const notification = require("../models/notificationModel");
const { io, onlineUsers } = require("../server");
const NotificationSeen = require("../models/notificationSeenModel");
const acceptRequest = async (req, res) => {

  try {

    const { requestId } = req.params;

    // Accept request logic (tumhara existing)
    const request =
      await userRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found"
      });
    }

    request.status = "accepted";
    request.acceptedBy = req.user.id;

    await request.save();

    // Find notification linked to this request
    const notif =
      await notification.findOne({
        requestId: requestId
      });

    if (notif) {

      // Delete all seen records
      await NotificationSeen.deleteMany({
        notificationId: notif._id
      });

    }

    res.status(200).json({
      message: "Request accepted successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
const cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await userRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    // Prevent cancel if already completed
    if (request.status === "completed") {
      return res.status(400).json({
        message: "Request already completed",
      });
    }

    // Only requester OR accepted donor cancel
    if (
      request.userId.toString() !== req.user.id &&
      request.acceptedBy?.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message: "Not allowed to cancel this request",
      });
    }

    request.status = "cancelled";

    await request.save();

    res.status(200).json({
      message: "Request cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await userRequest
      .find({
        $or: [
          { acceptedBy: userId, status: "completed" },
          { acceptedBy: userId, status: "accepted" },
        ],
      })
      .select("name bloodgroup unitbag hospitalname city status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "History fetched successfully", history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    if (!requestId)
      return res.status(400).json({
        message: "Request ID required",
      });

    const request = await userRequest.findById(requestId);

    if (!request)
      return res.status(404).json({
        message: "Request not found",
      });

    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "Request not accepted yet",
      });
    }
    // Only accepted donor can complete
   if (!request.acceptedBy || request.acceptedBy.toString() !== req.user.id) {
  return res.status(403).json({
    message: "You are not allowed to complete this request",
  });
}

    // Find donor profile first
    const profile = await userProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Prevent negative unitbag
    if (profile.unitbag <= 0) {
      return res.status(400).json({
        message: "No blood units available",
      });
    }

    // Mark request completed
    request.status = "completed";
    await request.save();

    // Update profile
    profile.unitbag -= 1;

    profile.lifeSaved += 1;

    profile.lastDonationDate = new Date();

    profile.bloodDonated = true;

    profile.isAvailable = false;

    await profile.save();

    const requesterSocket = onlineUsers?.[request.userId];

    if (requesterSocket) {
      io.to(requesterSocket).emit("requestCompleted", {
        requestId: request._id,
      });
    }

    res.status(200).json({
      message: "Donation completed successfully",
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message,
    });
  }
};
const getMyNotifications = async (req, res) => {

  try {

    const userId = req.user.id;

    const notifications =
      await notification
        .find()
        .sort({ createdAt: -1 });

    const seenData =
      await NotificationSeen.find({
        userId
      });

    const seenMap = {};

    seenData.forEach(item => {

      seenMap[item.notificationId] = item;

    });

    const finalNotifications =
      notifications
        .filter(n => {

          // Hide deleted
          return !seenMap[n._id]?.isDeleted;

        })
        .map(n => ({

          ...n._doc,

          isRead:
           seenMap[n._id]?.isRead || false

        }));

    res.status(200).json({
      notifications: finalNotifications
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
const markNotificationRead = async (req, res) => {

  try {

    const { notificationId } = req.params;

    const existing =
      await NotificationSeen.findOne({
        userId: req.user.id,
        notificationId
      });

    // If deleted — don't allow read
    if (existing?.isDeleted) {
      return res.status(400).json({
        message:
         "Notification already deleted"
      });
    }

    await NotificationSeen.findOneAndUpdate(
      {
        userId: req.user.id,
        notificationId
      },
      {
        isRead: true
      },
      {
        upsert: true,
        new: true
      }
    );

    res.status(200).json({
      message: "Notification marked as read"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
const deleteNotification = async (req, res) => {

  try {

    const { notificationId } = req.params;

    await NotificationSeen.findOneAndUpdate(
      {
        userId: req.user.id,
        notificationId
      },
      {
        isDeleted: true
      },
      {
        upsert: true
      }
    );

    res.status(200).json({
      message: "Notification deleted"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
module.exports = {
  acceptRequest,
  cancelRequest,
  completeRequest,
  getHistory,
  getMyNotifications,
  markNotificationRead,
  deleteNotification
};
