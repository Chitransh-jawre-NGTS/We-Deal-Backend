const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

// controllers/productController.js
exports.createProduct = async (req, res) => {
  try {
    // Parse JSON fields from FormData
    const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
    if (!fields) return res.status(400).json({ message: "fields are required" });

    const category = req.body.category;
    const images = req.files.map((file) => file.path);
    const sellerId = req.user.id;

    // Parse location if sent
    let locationData = null;
    if (req.body.location) {
      try {
        locationData = JSON.parse(req.body.location);
      } catch (err) {
        console.warn("Invalid location data:", err);
      }
    }

    if (!locationData || !Array.isArray(locationData.coordinates)) {
      return res.status(400).json({ message: "Valid location with coordinates is required" });
    }

    const product = new Product({
      fields,
      category,
      sellerId,
      images,
      location: locationData,
    });

    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create product", error: err });
  }
};






// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    const updatedProducts = products.map((product) => {
      const now = new Date();
      if (product.expiryDate && product.expiryDate < now) {
        product.status = "expired";
      } else {
        product.status = "active";
      }
      return product;
    });

    res.status(200).json({ products: updatedProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get products by user
exports.getUserProducts = async (req, res) => {
  try {
    const userId = req.user.id; // get from auth middleware

    const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user products" });
  }
};











// const sharp = require("sharp");
// const fs = require("fs");
// const path = require("path");

// exports.createProduct = async (req, res) => {
//   try {
//     const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
//     if (!fields) return res.status(400).json({ message: "fields are required" });

//     const category = req.body.category;
//     const sellerId = req.user.id;

//     const uploadPromises = req.files.map(async (file) => {
//       const compressedPath = path.join(__dirname, "../uploads", `compressed-${file.filename}.jpg`);

//       await sharp(file.path)
//         .resize(1200) // max width
//         .jpeg({ quality: 80 }) // adjust quality
//         .toFile(compressedPath);

//       const result = await cloudinary.uploader.upload(compressedPath, {
//         folder: "products",
//       });

//       // Cleanup local file
//       fs.unlinkSync(compressedPath);

//       return result.secure_url;
//     });

//     const images = await Promise.all(uploadPromises);

//     const product = new Product({
//       fields,
//       category,
//       sellerId,
//       images,
//       location: JSON.parse(req.body.location || "{}"),
//     });

//     await product.save();
//     res.status(201).json({ message: "Product created", product });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Failed to create product", error: err });
//   }
// };
