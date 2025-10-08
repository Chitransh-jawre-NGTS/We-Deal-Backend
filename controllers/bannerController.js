const BannerAd = require("../models/BannerAds");
const cloudinary = require("../config/cloudinary");

// Upload helper
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "mobile_ads", quality: "auto", fetch_format: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

// Create Banner
exports.createBanner = async (req, res) => {
  try {
    const { title, link, amount } = req.body;

    // Validate
    if (!title || !link) return res.status(400).json({ message: "Title and link are required" });
    if (!amount || amount < 10) return res.status(400).json({ message: "Minimum amount is Rs 10" });
    if (!req.file) return res.status(400).json({ message: "Banner image is required" });

    // Upload image
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // Get store from middleware
    const store = req.store;
    if (!store) return res.status(403).json({ message: "Store not verified" });

    // Calculate impressions
    const totalImpressions = Math.floor((amount / 20) * 1000);

    // Set expiry date (1 month)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // Save banner
    const banner = new BannerAd({
      store: store._id,
      title,
      link,
      image: imageUrl,
      amount,
      totalImpressions,
      expiryDate,
    });

    await banner.save();

    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
// Get banners of logged-in store
exports.getStoreBanners = async (req, res) => {
  try {
    const storeId = req.store._id;
    const banners = await BannerAd.find({ store: storeId });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await BannerAd.findOneAndDelete({ _id: req.params.id, store: req.store._id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Deactivate banner
exports.deactivateBanner = async (req, res) => {
  try {
    const banner = await BannerAd.findOne({ _id: req.params.id, store: req.store._id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    banner.active = false;
    await banner.save();
    res.json({ message: "Banner deactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};



// Get active banners
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await BannerAd.find({
      active: true,
      expiryDate: { $gt: new Date() },
    });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Track impression
exports.trackImpression = async (req, res) => {
  try {
    const banner = await BannerAd.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.currentImpressions += 1;
    if (banner.currentImpressions >= banner.totalImpressions) {
      banner.active = false;
    }

    await banner.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
