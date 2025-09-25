const Store = require("../models/store");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

// Helper function to upload buffer to Cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "store_logos" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// Create store
exports.createStore = async (req, res) => {
  try {
    const { name, email, phone, shopName, gstNumber, address, pincode, city, state, password } = req.body;

    const existingStore = await Store.findOne({ email });
    if (existingStore) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload shopLogo to Cloudinary if file exists
    let shopLogoUrl = null;
    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      shopLogoUrl = result.secure_url;
    }

    const newStore = await Store.create({
      name,
      email,
      phone,
      shopName,
      gstNumber,
      address,
      pincode,
      city,
      state,
      password: hashedPassword,
      shopLogo: shopLogoUrl,
      role: "store",
    });

    const token = jwt.sign({ id: newStore._id, role: newStore.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "Store created successfully", store: newStore, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update store
exports.updateStore = async (req, res) => {
  try {
    const storeId = req.params.id;
    const updateData = { ...req.body };

    if (req.body.password) updateData.password = await bcrypt.hash(req.body.password, 10);

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      updateData.shopLogo = result.secure_url;
    }

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, { new: true, runValidators: true }).select("-password");
    if (!updatedStore) return res.status(404).json({ message: "Store not found" });

    res.status(200).json({ message: "Store updated successfully", store: updatedStore });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.storeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) 
      return res.status(400).json({ message: "Email and password required" });

    const store = await Store.findOne({ email });
    if (!store || store.role !== "store") {
      return res.status(404).json({ message: "Store not found" });
    }

    const isMatch = await bcrypt.compare(password, store.password);
    if (!isMatch) 
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate JWT
    const storeToken = jwt.sign(
      { id: store._id, role: store.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send response with token key named 'storeToken'
    res.status(200).json({ message: "Login successful", store, storeToken });
  } catch (err) {
    console.error("Store Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
