const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

// Create product
exports.createProduct = async (req, res) => {
    console.log("Files received:", req.files); // Debugging
    console.log("Body received:", req.body); // Debugging
  try {
    // Check if files exist
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // req.files contains Cloudinary info
    const images = req.files.map((file) => file.path);

    const { category, fields } = req.body;

    const product = new Product({
      category,
      fields: JSON.parse(fields),
      images,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get products by user
exports.getUserProducts = async (req, res) => {
  try {
    const { userId } = req.params; // pass userId as route param
    const products = await Product.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
