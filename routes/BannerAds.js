const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const { createBanner, getActiveBanners, trackImpression, getStoreBanners, deleteBanner, deactivateBanner } = require("../controllers/bannerController");
// routes/BannerAds.js
const { storeMiddleware } = require("../middleware/storeMiddleware");


router.post("/banner/create", storeMiddleware, upload.single("image"), createBanner);
router.get("/banner/active", getActiveBanners);
router.post("/banner/impression/:id", trackImpression);


router.get("/banner/mystore", storeMiddleware, getStoreBanners);
router.delete("/banner/:id", storeMiddleware, deleteBanner);
router.patch("/banner/deactivate/:id", storeMiddleware, deactivateBanner);

module.exports = router;
