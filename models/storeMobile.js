// // models/MobileAd.js
// const mongoose = require("mongoose");

// const mobileAdSchema = new mongoose.Schema(
//   {
//     storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
//     brand: { type: String, required: true },
//     model: { type: String, required: true },
//     storage: { type: String, required: true },
//     year: { type: Number, required: true },
//     price: { type: Number, required: true },
//     title: { type: String, required: true },
//     description: { type: String, default: "" },
//     images: [{ type: String }], // URLs from Cloudinary

//     // ✅ New fields
//     status: {
//       type: String,
//       enum: ["Active", "Deactivated"],
//       default: "Active", // default for new ads
//     },
//     featured: {
//       type: Boolean,
//       default: false, // set true if price > 20000 in controller
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("MobileAd", mobileAdSchema);

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

    // ✅ New fields
    status: {
      type: String,
      enum: ["Active", "Deactivated"],
      default: "Active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date, // auto-expire date
    },
  },
  { timestamps: true }
);

// Set expiresAt automatically if not set
mobileAdSchema.pre("save", function (next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date(this.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
  }
  next();
});

module.exports = mongoose.model("MobileAd", mobileAdSchema);
