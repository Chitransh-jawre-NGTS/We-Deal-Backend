// routes/storeMobileRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const {storeMiddleware }= require("../middleware/storeMiddleware");
const mobileAdController = require("../controllers/storeMobileController");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/create", storeMiddleware, upload.array("images", 5), mobileAdController.createMobileAd);
router.get("/my-ads", storeMiddleware, mobileAdController.getStoreAds);
// Public route for all users
router.get("/all-ads", mobileAdController.getAllAds);
// ✅ Deactivate an ad
router.patch("/deactivate/:adId", storeMiddleware, mobileAdController.deactivateAd);

// ✅ Delete an ad
router.delete("/delete/:adId", storeMiddleware, mobileAdController.deleteAd);


module.exports = router;
