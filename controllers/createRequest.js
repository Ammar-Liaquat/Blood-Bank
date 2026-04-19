const userRequest = require("../models/requestModel");
const userProfile = require("../models/profileModel");
const notification = require("../models/notificationModel");

const createRequest = async (req, res) => {
  try {
    const io = req.app.get("io");

    const {
      name,
      bloodgroup,
      unitbag,
      timelimit,
      city,
      hospitalname,
      longitude,
      latitude,
      phonenumber 
    } = req.body;

    const unitBagNumber = parseInt(unitbag);

    if (isNaN(unitBagNumber)) {
      return res.status(400).json({
        message: "unitbag must be a number",
      });
    }
    const profile = await userProfile.findOne({ userId: req.user.id });

    const request = await userRequest.create({
      userId: req.user.id,
      name,
      bloodgroup,
      unitbag: unitBagNumber,
      timelimit: new Date(timelimit),
      city,
      hospitalname,
      phonenumber,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    if(profile?.notificationsEnabled) {
    const notif = await notification.create({
      userId: req.user.id,
      requestId: request._id,
      name,
      bloodgroup,
      unitbag: unitBagNumber,
      city,
      phonenumber,
      message: `New blood request from ${name} for ${unitBagNumber} units (${bloodgroup})`,
    });

    // Safe emit
    io.emit("newBloodRequest", {
      requestId: request._id,
      name,
      bloodgroup,
      hospitalname,
      city,
      unitbag: unitBagNumber,
      phonenumber
    });
  }
    res.status(201).json({
      message: "Request Created Successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
// Get Nearby Donors
const getNearByDonors = async (req, res) => {
  try {
    const { bloodgroup, longitude, latitude } = req.query;

    if (!bloodgroup || !longitude || !latitude) {
      return res.status(400).json({
        message: "bloodgroup, longitude and latitude are required",
      });
    }

    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);

    const cleanBloodGroup = bloodgroup.replace(/ /g, "+").trim();

    const users = await userProfile.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "distance",
          spherical: true,
          query: {
            bloodgroup: cleanBloodGroup,
            $expr: { $gt: [{ $toInt: "$unitbag" }, 0] },
            isAvailable: true,
            bloodDonated: false,
            notificationsEnabled: true, // only available donors
          },
          maxDistance: 15000, // 15km
        },
      },
      {
        $project: {
          name: 1,
          bloodgroup: 1,
          phonenumber: 1,
          address: 1,
          unitbag: 1,
          distance: 1,
          timelimit: 1,
        },
      },
    ]);

    console.log("Bloodgroup received:", cleanBloodGroup);

    const usersWithKm = users.map((u) => ({
      ...u,
      distance: (u.distance / 1000).toFixed(2) + " km",
      timelimit: new Date(u.timelimit).toLocaleString(), // ya .toDateString()
    }));

    res.status(200).json({ users: usersWithKm });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  createRequest,
  getNearByDonors,
};
