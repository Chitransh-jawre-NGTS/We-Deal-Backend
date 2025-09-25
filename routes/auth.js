const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/auth");
const {
  loginWithFirebase,
  updateProfile,
  getProfile,
  deleteAccount,
  deactivateAccount
} = require("../controllers/authController");

// ✅ Firebase login/signup
router.post("/login-email", loginWithFirebase);

// ✅ Update profile (protected)
router.put("/update/:id", authMiddleware, upload.single("avatar"), updateProfile);

// ✅ Get profile
router.get("/user/profile", authMiddleware, getProfile);

// ✅ Delete account
router.delete("/user/delete", authMiddleware, deleteAccount);

// ✅ Deactivate account
router.put("/user/deactivate", authMiddleware, deactivateAccount);

module.exports = router;
