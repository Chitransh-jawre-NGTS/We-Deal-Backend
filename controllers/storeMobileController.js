const MobileAd = require("../models/storeMobile");
const cloudinary = require("../config/cloudinary");
const Store = require("../models/store"); 

const mongoose = require("mongoose");

// Helper to upload a single file buffer to Cloudinary
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

// Create mobile ad
exports.createMobileAd = async (req, res) => {
  try {
    const { brand, model, storage, year, price, title, description } = req.body;
    const storeId = req.store._id;

    if (!brand || !model || !storage || !year || !price || !title) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // ✅ Monthly ad limit check
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const adsThisMonth = await MobileAd.countDocuments({
      storeId,
      createdAt: { $gte: startOfMonth },
    });

    if (adsThisMonth >= 10) {
      return res.status(400).json({ message: "Monthly ad limit reached (10 ads/month)" });
    }

    // ✅ Max images per ad
    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: "You can upload a maximum of 5 images per ad" });
    }

    // Upload images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        uploadedImages.push(url);
      }
    }

    // Set expiration date 30 days from now
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Save ad to MongoDB
    const newAd = await MobileAd.create({
      storeId,
      brand,
      model,
      storage,
      year,
      price,
      title,
      description,
      images: uploadedImages,
      status: "Active",
      expiresAt,
    });

    res.status(201).json({ message: "Mobile ad created successfully", ad: newAd });
  } catch (err) {
    console.error("Create Mobile Ad Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};




// Get all ads for a store
exports.getStoreAds = async (req, res) => {
  try {
    const storeId = req.store._id;

    // Fetch ads for the store
    const ads = await MobileAd.find({ storeId }).sort({ createdAt: -1 });

    // Include basic store info
    const storeData = {
      _id: req.store._id,
      name: req.store.name,
      logo: req.store.logo,
      trusted: req.store.trusted || true,
      description: req.store.description || "",
      location: req.store.location || "", // if you store location
    };

    res.status(200).json({ store: storeData, ads });
  } catch (err) {
    console.error("Get Store Ads Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllAds = async (req, res) => {
  try {
    const ads = await MobileAd.find({ status: "Active" }).sort({ createdAt: -1 }).lean();

    const adsWithStore = await Promise.all(
      ads.map(async (ad) => {
        const store = await Store.findById(ad.storeId).lean(); 
        return {
          ...ad,
          store: store
            ? {
                _id: store._id,
                name: store.shopName,      // map shopName → name
                logo: store.shopLogo || "", // map shopLogo → logo
                trusted: store.isActive,    // use isActive for trusted
                location: `${store.city}, ${store.state}` || "",
                description: store.address || "",
              }
            : null,
        };
      })
    );

    res.status(200).json({ ads: adsWithStore });
  } catch (err) {
    console.error("Get All Ads Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Deactivate a mobile ad
exports.deactivateAd = async (req, res) => {
  try {
    const { adId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await MobileAd.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Only owner can deactivate
    if (ad.storeId.toString() !== req.store._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    ad.status = "Deactivated";
    await ad.save();

    res.status(200).json({ message: "Ad deactivated successfully", ad });
  } catch (err) {
    console.error("Deactivate Ad Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a mobile ad
exports.deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await MobileAd.findById(adId);
    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Only owner can delete
    if (ad.storeId.toString() !== req.store._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await MobileAd.findByIdAndDelete(adId);

    res.status(200).json({ message: "Ad deleted successfully" });
  } catch (err) {
    console.error("Delete Ad Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
