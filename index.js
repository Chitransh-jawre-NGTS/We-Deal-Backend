const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlist");

dotenv.config();
const app = express();
app.use(express.json());

// ✅ Enable CORS
app.use(cors({
  origin:[ "http://localhost:5173", "https://we-deal-backend.onrender.com" ],  // replace with your frontend URL
  credentials: true
}));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api", wishlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
