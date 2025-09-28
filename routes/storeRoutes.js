const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { storeMiddleware } = require("../middleware/storeMiddleware");
const multer = require("multer");

// Multer setup (store file in memory for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public route - Register as store
router.post("/register", upload.single("shopLogo"), storeController.createStore);
router.get("/profile", storeMiddleware, storeController.getStoreProfile);

// Login store
router.post("/login", storeController.storeLogin);

// Update store (protected: only complete store profile can update)
router.put(
  "/update/:id",
  storeMiddleware,            // check if store exists and profile is complete
  upload.single("shopLogo"),
  storeController.updateStore
);

module.exports = router;
