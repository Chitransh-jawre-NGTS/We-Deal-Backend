const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { fields, category } = req.body;
    const images = req.files.map((file) => file.path); // if using multer/cloudinary

    // Get sellerId from authenticated user
    const sellerId = req.user.id;

    const product = new Product({
      fields: JSON.parse(fields),
      category,
      images,
      sellerId, // 👈 add sellerId here
    });

    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create product" });
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
    const userId = req.user.id; // get from auth middleware

    const products = await Product.find({ sellerId: userId }).sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user products" });
  }
};
