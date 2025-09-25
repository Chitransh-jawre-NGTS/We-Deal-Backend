const jwt = require("jsonwebtoken");
const Store = require("../models/store");

exports.storeMiddleware = async (req, res, next) => {
  try {
    console.log("Store Middleware Invoked");

    // ✅ Get token from custom header
    const token = req.headers["x-store-token"]; // instead of 'authorization'
    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (decoded.role !== "store") return res.status(403).json({ message: "Unauthorized" });

    const storeId = decoded.id;

    // Fetch store from DB
    const store = await Store.findById(storeId);
    if (!store || store.role !== "store") {
      return res.status(404).json({ message: "Store not found or invalid role" });
    }

    // Check required profile fields
    const requiredFields = ["shopName", "gstNumber", "address", "pincode", "city", "state"];
    const missingFields = requiredFields.filter(field => !store[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Incomplete store profile",
        missingFields,
      });
    }

    // Attach store to request
    req.store = store;
    next();

  } catch (err) {
    console.error("Store Middleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
