const express = require("express");
const router = express.Router();
const passwordController = require("../controllers/forgotPassword");

// Step 1: Send OTP
router.post("/forgot-password", passwordController.sendOtp);

// Step 2: Verify OTP
router.post("/verify-otp", passwordController.verifyOtp);

// Step 3: Reset Password
router.post("/reset-password", passwordController.resetPassword);

module.exports = router;
