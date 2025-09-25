// controllers/mobileAdController.js
const MobileAd = require("../models/storeMobile");
const cloudinary = require("../config/cloudinary"); // your Cloudinary setup

// Create mobile ad
exports.createMobileAd = async (req, res) => {
    comsole.log("Request Body:", req.body);
  try {
    const { brand, model, storage, year, price, title, description } = req.body;
    const storeId = req.store._id; // from storeMiddleware (store must be logged in)

    if (!brand || !model || !storage || !year || !price || !title) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < Math.min(req.files.length, 5); i++) {
        const result = await cloudinary.uploader.upload(req.files[i].path, {
          folder: "mobile_ads",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const newAd = await MobileAd.create({
      storeId,
      brand,
      model,
      storage,
      year,
      price,
      title,
      description,
      images: imageUrls,
    });

    res.status(201).json({ message: "Mobile ad created successfully", ad: newAd });
  } catch (err) {
    console.error("Create Mobile Ad Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all ads for a store
exports.getStoreAds = async (req, res) => {
  try {
    const storeId = req.store._id;
    const ads = await MobileAd.find({ storeId }).sort({ createdAt: -1 });
    res.status(200).json({ ads });
  } catch (err) {
    console.error("Get Store Ads Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
