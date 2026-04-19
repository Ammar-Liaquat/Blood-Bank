const UserProfile = require("../models/profileModel");
const deleteFile = require("../utils/deleteFile");

const createProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      age,
      gender,
      bloodgroup,
      phonenumber,
      address,
      thalassemia,
      unitbag,
      lastDonationDate,
      longitude,
      latitude,
    } = req.body;

    // Check profile
    const existingProfile = await UserProfile.findOne({ userId });

    if (existingProfile) {
      deleteFile(req.file?.path);

      return res.status(400).json({
        code: 400,
        message: "user already exsits",
      });
    }

    // Create profile
    const profile = await UserProfile.create({
      userId,
      avatar: req.file ? req.file.path : null,
      name,
      age,
      gender,
      bloodgroup,
      phonenumber,
      address,
      unitbag,
      thalassemia,
      lastDonationDate,
      bloodDonated: false,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });

    res.status(201).json({
      code: 201,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: " Internal Server Error",
      error: error.message,
    });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        code: 404,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      code: 200,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      age,
      gender,
      bloodgroup,
      phonenumber,
      address,
      thalassemia,
      unitbag,
      lastDonationDate,
    } = req.body;

    // Find profile
    const profile = await UserProfile.findOne({ userId });

    if (!profile) {
      deleteFile(req.file?.path);

      return res.status(404).json({
        code: 404,
        message: "Profile not found",
      });
    }
    if (req.file && profile.avatar) {
      deleteFile(profile.avatar);
    }

    // Update fields
    profile.name = name || profile.name;
    profile.age = age || profile.age;
    profile.gender = gender || profile.gender;
    profile.bloodgroup = bloodgroup || profile.bloodgroup;
    profile.phonenumber = phonenumber || profile.phonenumber;
    profile.address = address || profile.address;
    profile.thalassemia = thalassemia || profile.thalassemia;
    profile.unitbag = unitbag || profile.unitbag;
    profile.lastDonationDate = lastDonationDate || profile.lastDonationDate;
    profile.avatar = req.file ? req.file.path : profile.avatar;
    profile.bloodDonated = false;

    await profile.save();

    res.status(200).json({
      code: 200,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    // delete newly uploaded image if error
    deleteFile(req.file?.path);

    res.status(500).json({
      code: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    const today = new Date();

    // 🧠 If trying to become AVAILABLE
    if (profile.isAvailable === false) {
      if (profile.bloodDonated === true) {
        const lastDonation = new Date(profile.lastDonationDate);

        const diffDays = (today - lastDonation) / (1000 * 60 * 60 * 24);

        if (diffDays < 90) {
          const remainingDays = Math.ceil(90 - diffDays);

          return res.status(400).json({
            message: "Blood de chuke ho. 3 month baad available ho sakte ho.",
            remainingDays,
          });
        }

        // 3 months completed
        profile.bloodDonated = false;
        profile.lastDonationDate = null;
      }

      profile.isAvailable = true;
    } else {
      // Manual OFF
      profile.isAvailable = false;
    }

    await profile.save();

    res.status(200).json({
      data: {
        isAvailable: profile.isAvailable,
        notificationsEnabled: profile.notificationsEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const toggleNotification = async (req, res) => {
  try {
    const profile = await UserProfile.findOne({
      userId: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found",
      });
    }

    // Toggle value
    profile.notificationsEnabled = !profile.notificationsEnabled;

    await profile.save();

    res.status(200).json({
      data: {
        isAvailable: profile.isAvailable,
        notificationsEnabled: profile.notificationsEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  toggleAvailability,
  toggleNotification,
};
