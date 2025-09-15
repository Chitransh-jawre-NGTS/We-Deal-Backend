// controllers/wishlistController.js
const Wishlist = require("../models/wishlist");

// Get current user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
    console.log("Add to wishlist request body:", req.body); // Debugging
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "Product ID is required" });

  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: "Product ID is required" });

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
