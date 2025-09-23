


const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const {
  sendOtp,
  verifyOtp,
  updateProfile,
  getProfile,deleteAccount,deactivateAccount
} = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.put("/update/:id", upload.single("avatar"), updateProfile);

// ✅ Get profile of logged-in user
router.get("/user/profile", authMiddleware, getProfile);
// Delete account
router.delete("/user/delete", authMiddleware, deleteAccount);

// Deactivate account
router.put("/user/deactivate", authMiddleware, deactivateAccount);


module.exports = router;


