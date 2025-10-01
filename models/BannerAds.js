const mongoose = require("mongoose");

const bannerAdSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  link: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  amount: { type: Number, required: true, min: 10 }, // Amount paid by store
  totalImpressions: { type: Number, required: true }, // Calculated from amount
  currentImpressions: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  expiryDate: { type: Date, required: true }, // auto-set in controller
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BannerAd", bannerAdSchema);
