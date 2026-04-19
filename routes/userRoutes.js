const express = require("express")
const { createUsers, verifyOtp, resendOtp, userLogin, forgotPassword, resetPassword, logoutUser, refreshAccessToken } = require("../controllers/users")
const validate = require("../middlewares/validator")
const {registerSchema, passwordSchema, profileSchema} = require("../validators/userValidate")
const upload = require("../middlewares/multer")
const { createProfile, updateProfile, getMyProfile, toggleAvailability, toggleNotification,} = require("../controllers/createProfile")
const router = express.Router()
const middleware = require("../middlewares/auth")
const { getNearByDonors, createRequest } = require("../controllers/createRequest")
const { acceptRequest, cancelRequest, getHistory, completeRequest, getMyNotifications, markNotificationRead, deleteNotification } = require("../controllers/getRequest")

// Auth Routes
router.post("/signup",validate(registerSchema),createUsers)
router.post("/login",userLogin)
router.post("/logout",middleware,logoutUser)
router.post("/refresh-token", refreshAccessToken);
// OTP Routes
router.post("/verifyotp",verifyOtp)
router.post("/resendotp",resendOtp)
// Password Reset Routes
router.post("/forgot-password",forgotPassword)
router.post("/reset-password",validate(passwordSchema),resetPassword)
// Profile Routes
router.post("/create-profile",middleware,upload.single("image"),validate(profileSchema),createProfile);
router.get("/my-profile", middleware, getMyProfile);
router.patch("/toggle-availability", middleware, toggleAvailability);
router.put("/update-profile",middleware,upload.single("image"),updateProfile)
// Blood Request Routes
router.post("/request",middleware,createRequest)
router.get("/request-blood",middleware,getNearByDonors)
// Request Actions
router.post("/accept-requests/:requestId",middleware,acceptRequest)
router.post("/cancel-requests/:requestId",middleware,cancelRequest)
router.patch("/complete-request/:requestId", middleware, completeRequest);
// Notifications
router.get("/getnotifications",middleware,getMyNotifications)
router.patch("/mark-read/:notificationId",middleware,markNotificationRead);
router.patch("/delete/:notificationId",middleware,deleteNotification);

// History Routes
router.get("/history",middleware,getHistory)
// Notifications 
router.patch("/notification",middleware,toggleNotification);

module.exports = router

