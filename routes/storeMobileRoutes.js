// routes/mobileAdRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const mobileAdController = require("../controllers/storeMobileController");
const storeMiddleware = require("../middleware/storeMiddleware");

// Multer setup for multiple files
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protected routes - store must be logged in
router.post("/create", storeMiddleware, upload.array("images", 5), mobileAdController.createMobileAd);
router.get("/my-ads", storeMiddleware, mobileAdController.getStoreAds);

module.exports = router;
