const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { sendOtp, verifyOtp, updateProfile } = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
// Update profile (avatar + name/email/aadhaarNumber)
router.put("/update/:id", upload.single("avatar"), updateProfile);

module.exports = router;
