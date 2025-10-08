// const MobileAd = require("../models/storeMobile");
// const cloudinary = require("../config/cloudinary");
// const Store = require("../models/store"); 

// const mongoose = require("mongoose");

// // Helper to upload a single file buffer to Cloudinary
// const uploadToCloudinary = (fileBuffer) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: "mobile_ads", quality: "auto", fetch_format: "auto" },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result.secure_url);
//       }
//     );
//     stream.end(fileBuffer);
//   });
// };

// // Create mobile ad
// exports.createMobileAd = async (req, res) => {
//   try {
//     const { brand, model, storage, year, price, title, description } = req.body;
//     const storeId = req.store._id;

//     if (!brand || !model || !storage || !year || !price || !title) {
//       return res.status(400).json({ message: "All required fields must be filled" });
//     }

//     // ✅ Monthly ad limit check
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const adsThisMonth = await MobileAd.countDocuments({
//       storeId,
//       createdAt: { $gte: startOfMonth },
//     });

//     if (adsThisMonth >= 10) {
//       return res.status(400).json({ message: "Monthly ad limit reached (10 ads/month)" });
//     }

//     // ✅ Max images per ad
//     if (req.files && req.files.length > 5) {
//       return res.status(400).json({ message: "You can upload a maximum of 5 images per ad" });
//     }

//     // Upload images
//     const uploadedImages = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const url = await uploadToCloudinary(file.buffer);
//         uploadedImages.push(url);
//       }
//     }

//     // Set expiration date 30 days from now
//     const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

//     // Save ad to MongoDB
//     const newAd = await MobileAd.create({
//       storeId,
//       brand,
//       model,
//       storage,
//       year,
//       price,
//       title,
//       description,
//       images: uploadedImages,
//       status: "Active",
//       expiresAt,
//     });

//     res.status(201).json({ message: "Mobile ad created successfully", ad: newAd });
//   } catch (err) {
//     console.error("Create Mobile Ad Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };




// // Get all ads for a store
// exports.getStoreAds = async (req, res) => {
//   try {
//     const storeId = req.store._id;

//     // Fetch ads for the store
//     const ads = await MobileAd.find({ storeId }).sort({ createdAt: -1 });

//     // Include basic store info
//     const storeData = {
//       _id: req.store._id,
//       name: req.store.name,
//       logo: req.store.logo,
//       trusted: req.store.trusted || true,
//       description: req.store.description || "",
//       location: req.store.location || "", // if you store location
//     };

//     res.status(200).json({ store: storeData, ads });
//   } catch (err) {
//     console.error("Get Store Ads Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getAllAds = async (req, res) => {
//   try {
//     const ads = await MobileAd.find({ status: "Active" }).sort({ createdAt: -1 }).lean();

//     const adsWithStore = await Promise.all(
//       ads.map(async (ad) => {
//         const store = await Store.findById(ad.storeId).lean(); 
//         return {
//           ...ad,
//           store: store
//             ? {
//                 _id: store._id,
//                 name: store.shopName,      // map shopName → name
//                 logo: store.shopLogo || "", // map shopLogo → logo
//                 trusted: store.isActive,    // use isActive for trusted
//                 location: `${store.city}, ${store.state}` || "",
//                 description: store.address || "",
//               }
//             : null,
//         };
//       })
//     );

//     res.status(200).json({ ads: adsWithStore });
//   } catch (err) {
//     console.error("Get All Ads Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };



// // Deactivate a mobile ad
// exports.deactivateAd = async (req, res) => {
//   try {
//     const { adId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(adId)) {
//       return res.status(400).json({ message: "Invalid ad ID" });
//     }

//     const ad = await MobileAd.findById(adId);
//     if (!ad) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     // Only owner can deactivate
//     if (ad.storeId.toString() !== req.store._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     ad.status = "Deactivated";
//     await ad.save();

//     res.status(200).json({ message: "Ad deactivated successfully", ad });
//   } catch (err) {
//     console.error("Deactivate Ad Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Delete a mobile ad
// exports.deleteAd = async (req, res) => {
//   try {
//     const { adId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(adId)) {
//       return res.status(400).json({ message: "Invalid ad ID" });
//     }

//     const ad = await MobileAd.findById(adId);
//     if (!ad) {
//       return res.status(404).json({ message: "Ad not found" });
//     }

//     // Only owner can delete
//     if (ad.storeId.toString() !== req.store._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     await MobileAd.findByIdAndDelete(adId);

//     res.status(200).json({ message: "Ad deleted successfully" });
//   } catch (err) {
//     console.error("Delete Ad Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };




const mongoose = require("mongoose");
const MobileAd = require("../models/storeMobile");
const cloudinary = require("../config/cloudinary");
const Store = require("../models/store");
const MobileAdCount = require("../models/StoreCount");

// Helper to upload buffer to Cloudinary
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

// ==================== CREATE MOBILE AD ====================
exports.createMobileAd = async (req, res) => {
  try {
    const { brand, model, storage, year, price, title, description } = req.body;
    const storeId = req.store._id;

    if (!brand || !model || !storage || !year || !price || !title) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // ==================== PLAN-BASED AD LIMIT CHECK ====================
    const now = new Date();
    const month = now.getMonth() + 1;
    const yearNow = now.getFullYear();

    let adStats = await MobileAdCount.findOne({ storeId, month, year: yearNow });
    if (!adStats) adStats = await MobileAdCount.create({ storeId, month, year: yearNow });

    const hasPaidPlan = adStats.paidPlanExpiry && adStats.paidPlanExpiry > now;
    const planType = hasPaidPlan ? "premium" : "free";

    if (planType === "premium") {
      if (adStats.premiumAdsPosted >= (adStats.premiumAdsLimit || 0)) {
        return res.status(403).json({
          message: "No premium ads left. Please renew or upgrade your plan.",
          redirectTo: "/billing",
        });
      }
      adStats.premiumAdsPosted += 1;
    } else {
      if (adStats.freeAdsPosted >= (adStats.freeAdsLimit || 0)) {
        return res.status(403).json({
          message: "No free ads left. Please upgrade to a premium plan.",
          redirectTo: "/billing",
        });
      }
      adStats.freeAdsPosted += 1;
    }

    // ==================== IMAGE UPLOAD ====================
    if (req.files && req.files.length > 5) {
      return res.status(400).json({ message: "You can upload a maximum of 5 images per ad" });
    }

    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer);
        uploadedImages.push(url);
      }
    }

    // Set expiry 30 days later
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Save ad
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

    await adStats.save();

    res.status(201).json({ message: "Mobile ad created successfully", ad: newAd });
  } catch (err) {
    console.error("Create Mobile Ad Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==================== ACTIVATE PLAN ====================
exports.activateStorePlan = async (req, res) => {
  try {
    const storeId = req.store._id;
    const { planType } = req.body; // "free" or "premium"

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await MobileAdCount.findOne({ storeId, month, year });
    if (!adStats) {
      adStats = await MobileAdCount.create({ storeId, month, year });
    }

    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    if (planType === "premium") {
      adStats.premiumAdsLimit = (adStats.premiumAdsLimit || 0) + 10;
      adStats.paidPlanExpiry = expiryDate;
    } else {
      adStats.freeAdsLimit = (adStats.freeAdsLimit || 0) + 5;
    }

    await adStats.save();

    res.status(200).json({ message: "Plan activated successfully", adStats });
  } catch (err) {
    console.error("Activate Plan Error:", err);
    res.status(500).json({ message: "Failed to activate plan", error: err.message });
  }
};

// ==================== GET STORE AD STATS ====================
exports.getStoreAdStats = async (req, res) => {
  try {
    const storeId = req.store._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await MobileAdCount.findOne({ storeId, month, year });
    if (!adStats) {
      adStats = await MobileAdCount.create({ storeId, month, year });
    }

    const freeAdsLeft = Math.max((adStats.freeAdsLimit || 0) - (adStats.freeAdsPosted || 0), 0);
    const premiumAdsLeft = Math.max((adStats.premiumAdsLimit || 0) - (adStats.premiumAdsPosted || 0), 0);
    const hasPaidPlan = adStats.paidPlanExpiry && adStats.paidPlanExpiry > now;

    res.status(200).json({
      storeId,
      freeAdsLeft,
      premiumAdsLeft,
      hasPaidPlan,
      planExpiry: adStats.paidPlanExpiry || null,
    });
  } catch (err) {
    console.error("Get Store Ad Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch ad stats", error: err.message });
  }
};

// ==================== GET ALL ADS ====================
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
                name: store.shopName,
                logo: store.shopLogo || "",
                trusted: store.isActive,
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

// ==================== GET STORE ADS ====================
exports.getStoreAds = async (req, res) => {
  try {
    const storeId = req.store._id;
    const ads = await MobileAd.find({ storeId }).sort({ createdAt: -1 });

    const storeData = {
      _id: req.store._id,
      name: req.store.name,
      logo: req.store.logo,
      trusted: req.store.trusted || true,
      description: req.store.description || "",
      location: req.store.location || "",
    };

    res.status(200).json({ store: storeData, ads });
  } catch (err) {
    console.error("Get Store Ads Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== DEACTIVATE AD ====================
exports.deactivateAd = async (req, res) => {
  try {
    const { adId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await MobileAd.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

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

// ==================== DELETE AD ====================
exports.deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ message: "Invalid ad ID" });
    }

    const ad = await MobileAd.findById(adId);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

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
