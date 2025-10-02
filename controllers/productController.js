


// const mongoose = require("mongoose"); // ✅ Add this
// const Product = require("../models/product");
// const cloudinary = require("../config/cloudinary");
// const User = require("../models/user"); // ✅ Add this


// // controllers/productController.js

// exports.createProduct = async (req, res) => {
//   try {
//     // Parse JSON fields from FormData
//     const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
//     if (!fields) return res.status(400).json({ message: "fields are required" });

//     const category = req.body.category;
//     const sellerId = req.user.id;

//     // ✅ Get user to check ad limits
//     const user = await User.findById(sellerId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Reset ads if month changed
//     const now = new Date();
//     if (now.getMonth() !== new Date(user.lastReset).getMonth()) {
//       user.adsPosted = 0;
//       user.lastReset = now;
//       await user.save();
//     }

//     // ✅ Check if free ad limit exceeded
//     if (user.adsPosted >= user.adsLimit) {
//       return res.status(403).json({
//         message: "Free ad limit reached. Please upgrade or pay to post more ads.",
//       });
//     }

//     // Parse location if sent
//     let locationData = null;
//     if (req.body.location) {
//       try {
//         locationData = JSON.parse(req.body.location);
//       } catch (err) {
//         console.warn("Invalid location data:", err);
//       }
//     }

//     if (!locationData || !Array.isArray(locationData.coordinates)) {
//       return res.status(400).json({ message: "Valid location with coordinates is required" });
//     }

//     // ✅ Upload images to Cloudinary
//     const uploadedImages = [];
//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path, {
//         folder: "products",
//         quality: "auto",
//         fetch_format: "auto",
//       });
//       uploadedImages.push(result.secure_url);
//     }

//     // Create product with Cloudinary URLs
//     const product = new Product({
//       fields,
//       category,
//       sellerId,
//       images: uploadedImages,
//       location: locationData,
//     });

//     await product.save();

//     // ✅ Increment user ad count
//     user.adsPosted += 1;
//     await user.save();

//     res.status(201).json({ message: "Product created", product });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Failed to create product", error: err.message });
//   }
// };


// exports.getUserAdStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("adsPosted adsLimit plan");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     const adsLimit = user.adsLimit || 5; // default to 5 if missing
//     const adsPosted = user.adsPosted || 0;

//     res.status(200).json({
//       adsPosted,
//       adsLimit,
//       remaining: Math.max(adsLimit - adsPosted, 0),
//      plan: user.plan || "free",
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch ad stats", error: err.message });
//   }
// };



// // Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });

//     const updatedProducts = products.map((product) => {
//       const now = new Date();
//       if (product.expiryDate && product.expiryDate < now) {
//         product.status = "expired";
//       } else {
//         product.status = "active";
//       }
//       return product;
//     });

//     res.status(200).json({ products: updatedProducts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // Get products by user
// exports.getUserProducts = async (req, res) => {
//   try {
//     const userId = req.user.id; // get from auth middleware

//     const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

//     res.status(200).json({ products });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch user products" });
//   }
// };


// exports.deleteProduct = async (req, res) => {
//   const { productId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return res.status(400).json({ message: "Invalid product ID" });
//   }

//   try {
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     // Only allow the owner to delete
//     if (!product.sellerId || req.user.id !== product.sellerId.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     // Use findByIdAndDelete instead of product.remove()
//     await Product.findByIdAndDelete(productId);

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };















































// const mongoose = require("mongoose");
// const Product = require("../models/product");
// const cloudinary = require("../config/cloudinary");
// const User = require("../models/user");
// const AdCount = require("../models/AdCount");

// exports.createProduct = async (req, res) => {
//   try {
//     const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
//     if (!fields) return res.status(400).json({ message: "fields are required" });

//     const category = req.body.category;
//     const sellerId = req.user.id;

//     const adStats = req.adStats; // from middleware

//     // Determine if ad is featured
//     let isFeatured = false;
//     if (req.body.planType === "premium" && adStats.premiumAdsLimit > adStats.premiumAdsPosted) {
//       isFeatured = true;
//       adStats.premiumAdsPosted += 1;
//     } else if (req.body.planType === "base" && adStats.baseAdsLimit > adStats.baseAdsPosted) {
//       isFeatured = false;
//       adStats.baseAdsPosted += 1;
//     } else {
//       return res.status(403).json({ message: "No ads left for this plan. Please buy a plan." });
//     }

//     // Upload images
//     const uploadedImages = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "products",
//           quality: "auto",
//           fetch_format: "auto",
//         });
//         uploadedImages.push(result.secure_url);
//       }
//     }

//     // Parse location
//     let locationData = null;
//     if (req.body.location) {
//       locationData = JSON.parse(req.body.location);
//     }
//     if (!locationData || !Array.isArray(locationData.coordinates)) {
//       return res.status(400).json({ message: "Valid location with coordinates is required" });
//     }

//     // Create product
//     const product = new Product({
//       fields,
//       category,
//       sellerId,
//       images: uploadedImages,
//       location: locationData,
//       featured: isFeatured, // ✅ mark ad as featured or not
//     });
//     await product.save();
//     await adStats.save();

//     res.status(201).json({ message: "Product created", product });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to create product", error: err.message });
//   }
// };



// // Get user ad stats
// exports.getUserAdStats = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const now = new Date();
//     const month = now.getMonth() + 1;
//     const year = now.getFullYear();

//     let adStats = await AdCount.findOne({ userId, month, year });
//     if (!adStats) {
//       adStats = await AdCount.create({ userId, month, year });
//     }

//     const hasPaidPlan =
//       adStats.paidPlanExpiry &&
//       adStats.paidPlanExpiry > now &&
//       adStats.paidAdsPosted < adStats.paidAdsLimit;

//     res.status(200).json({
//       adsPosted: adStats.freeAdsPosted + adStats.paidAdsPosted,
//       freeAdsLeft: Math.max(adStats.freeAdsLimit - adStats.freeAdsPosted, 0),
//       paidAdsLeft: hasPaidPlan
//         ? adStats.paidAdsLimit - adStats.paidAdsPosted
//         : 0,
//       hasPaidPlan,
//       planExpiry: adStats.paidPlanExpiry,
//       plan: req.user.plan || "free",
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch ad stats", error: err.message });
//   }
// };

// exports.activatePlan = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { planType } = req.body; // "base" or "premium"

//     const now = new Date();
//     const month = now.getMonth() + 1;
//     const year = now.getFullYear();

//     let adStats = await AdCount.findOne({ userId, month, year });
//     if (!adStats) {
//       adStats = await AdCount.create({ userId, month, year });
//     }

//     // Expiry: 30 days
//     const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

//     if (planType === "base") {
//       // Base plan -> non-featured ad
//       adStats.baseAdsLimit = (adStats.baseAdsLimit || 0) + 1;
//     } else if (planType === "premium") {
//       // Premium plan -> featured ad
//       adStats.premiumAdsLimit = (adStats.premiumAdsLimit || 0) + 1;
//     }

//     adStats.planExpiry = expiryDate;
//     await adStats.save();

//     res.status(200).json({ message: "Plan activated", adStats });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to activate plan", error: err.message });
//   }
// };


// // Get all products
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });

//     const updatedProducts = products.map((product) => {
//       const now = new Date();
//       if (product.expiryDate && product.expiryDate < now) {
//         product.status = "expired";
//       } else {
//         product.status = "active";
//       }
//       return product;
//     });

//     res.status(200).json({ products: updatedProducts });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Get products by user
// exports.getUserProducts = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });
//     res.status(200).json({ products });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch user products" });
//   }
// };

// // Delete a product
// exports.deleteProduct = async (req, res) => {
//   const { productId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(productId)) {
//     return res.status(400).json({ message: "Invalid product ID" });
//   }

//   try {
//     const product = await Product.findById(productId);

//     if (!product) return res.status(404).json({ message: "Product not found" });

//     // Only owner can delete
//     if (!product.sellerId || req.user.id !== product.sellerId.toString()) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     await Product.findByIdAndDelete(productId);

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };














// controllers/productController.js
const mongoose = require("mongoose");
const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");
const AdCount = require("../models/AdCount");

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
    if (!fields) return res.status(400).json({ message: "Fields are required" });

    const category = req.body.category;
    const sellerId = req.user.id;
    const planType = req.body.planType || "base"; // "base" = free, "premium" = paid

    const adStats = req.adStats; // from middleware

    if (!adStats) {
      return res.status(403).json({
        message: "Ad stats not found. Please check your plan or billing.",
      });
    }

    const now = new Date();
    let isFeatured = false;

    if (planType === "premium") {
      const hasPaidPlan = adStats.paidPlanExpiry && adStats.paidPlanExpiry > now;

      if (!hasPaidPlan || adStats.premiumAdsPosted >= (adStats.premiumAdsLimit || 0)) {
        return res.status(403).json({
          message: "No paid ads left. Please activate a paid plan.",
          redirectTo: "/billing",
        });
      }

      isFeatured = true;
      adStats.premiumAdsPosted = (adStats.premiumAdsPosted || 0) + 1;
    } else {
      // Base plan (free ads)
      if (adStats.freeAdsPosted >= (adStats.freeAdsLimit || 0)) {
        return res.status(403).json({
          message: "No free ads left. Please activate a paid plan.",
          redirectTo: "/billing",
        });
      }

      isFeatured = false;
      adStats.freeAdsPosted = (adStats.freeAdsPosted || 0) + 1;
    }

    // ==================== UPLOAD IMAGES ====================
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "products",
          quality: "auto",
          fetch_format: "auto",
        });
        uploadedImages.push(result.secure_url);
      }
    }

    // ==================== LOCATION ====================
    let locationData = null;
    if (req.body.location) {
      locationData = JSON.parse(req.body.location);
    }
    if (!locationData || !Array.isArray(locationData.coordinates)) {
      return res
        .status(400)
        .json({ message: "Valid location with coordinates is required" });
    }

    // ==================== CREATE PRODUCT ====================
    const product = new Product({
      fields,
      category,
      sellerId,
      images: uploadedImages,
      location: locationData,
      featured: isFeatured,
    });

    await product.save();
    await adStats.save();

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

// ==================== ACTIVATE PLAN ====================
exports.activatePlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planType } = req.body; // "base" or "premium"

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await AdCount.findOne({ userId, month, year });
    if (!adStats) {
      adStats = await AdCount.create({ userId, month, year });
    }

    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    if (planType === "premium") {
      adStats.premiumAdsLimit = (adStats.premiumAdsLimit || 0) + 1;
      adStats.paidPlanExpiry = expiryDate;
    } else if (planType === "base") {
      adStats.freeAdsLimit = (adStats.freeAdsLimit || 0) + 1;
    }

    await adStats.save();

    res.status(200).json({ message: "Plan activated", adStats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to activate plan", error: err.message });
  }
};

// ==================== GET USER AD STATS ====================
exports.getUserAdStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await AdCount.findOne({ userId, month, year });
    if (!adStats) {
      adStats = await AdCount.create({ userId, month, year });
    }

    // Total posted ads
    const adsPosted =
      (adStats.baseAdsPosted || 0) +
      (adStats.premiumAdsPosted || 0);

    // Remaining ads per plan
    const freeAdsLeft = Math.max((adStats.freeAdsLimit || 0) - (adStats.freeAdsPosted || 0), 0);
    const baseAdsLeft = Math.max((adStats.baseAdsLimit || 0) - (adStats.baseAdsPosted || 0), 0);
    const premiumAdsLeft = Math.max((adStats.premiumAdsLimit || 0) - (adStats.premiumAdsPosted || 0), 0);

    // Paid plan active check
    const hasPaidPlan = adStats.paidPlanExpiry && adStats.paidPlanExpiry > now;

    res.status(200).json({
      adsPosted,
      freeAdsLeft,
      baseAdsLeft,
      premiumAdsLeft,
      hasPaidPlan,
      planExpiry: adStats.paidPlanExpiry || null,
      plan: req.user.plan || "free",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch ad stats", error: err.message });
  }
};


// ==================== GET ALL PRODUCTS ====================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==================== GET USER PRODUCTS ====================
exports.getUserProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user products" });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.sellerId || req.user.id !== product.sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
