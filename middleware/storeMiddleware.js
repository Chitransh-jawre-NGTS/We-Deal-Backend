const jwt = require("jsonwebtoken");
const Store = require("../models/store");
exports.storeMiddleware = async (req, res, next) => {
  try {
    console.log("Auth middleware invoked");
    console.log("Headers received:", req.headers);

    // ✅ Try multiple variations
    const token =
      req.headers["x-store-token"] ||
      req.headers["X-Store-Token"] ||
      (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

    console.log("Final token value:", token);

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (decoded.role !== "store") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const store = await Store.findById(decoded.id);
    if (!store || store.role !== "store") {
      return res.status(404).json({ message: "Store not found or invalid role" });
    }

    req.store = store;
    next();
  } catch (err) {
    console.error("Store Middleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

