// const mongoose = require("mongoose"); // ✅ Add this
// const Product = require("../models/product");
// const cloudinary = require("../config/cloudinary");

// // controllers/productController.js
// exports.createProduct = async (req, res) => {
//   try {
//     // Parse JSON fields from FormData
//     const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
//     if (!fields) return res.status(400).json({ message: "fields are required" });

//     const category = req.body.category;
//     const images = req.files.map((file) => file.path);
//     const sellerId = req.user.id;

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

//     const product = new Product({
//       fields,
//       category,
//       sellerId,
//       images,
//       location: locationData,
//     });

//     await product.save();

//     res.status(201).json({ message: "Product created", product });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Failed to create product", error: err });
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



const mongoose = require("mongoose"); // ✅ Add this
const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

// controllers/productController.js

exports.createProduct = async (req, res) => {
  try {
    // Parse JSON fields from FormData
    const fields = req.body.fields ? JSON.parse(req.body.fields) : null;
    if (!fields) return res.status(400).json({ message: "fields are required" });

    const category = req.body.category;
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

    // ✅ Upload images to Cloudinary with compression
    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "products",
        quality: "auto",
        fetch_format: "auto",
      });
      uploadedImages.push(result.secure_url);
    }

    // Create product with Cloudinary URLs
    const product = new Product({
      fields,
      category,
      sellerId,
      images: uploadedImages,
      location: locationData,
    });

    await product.save();

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create product", error: err.message });
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


exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Only allow the owner to delete
    if (!product.sellerId || req.user.id !== product.sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Use findByIdAndDelete instead of product.remove()
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





