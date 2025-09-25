// models/MobileAd.js
const mongoose = require("mongoose");

const mobileAdSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    storage: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    images: [{ type: String }], // URLs from Cloudinary
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileAd", mobileAdSchema);
