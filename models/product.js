const mongoose = require("mongoose");

function arrayLimit(val) {
  return val.length <= 8;
}

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  fields: { type: Object, required: true }, 
  images: { type: [String], validate: [arrayLimit, "{PATH} exceeds the limit of 8"] },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  expiryDate: { type: Date, default: null }, // expire 1 day later
  status: { type: String, enum: ["active", "expired"], default: "active" },

  // ✅ Add location field
  location: {
    type: {
      type: String,
      enum: ["Point"], // Must be "Point"
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
});

// ✅ Index for geospatial queries
productSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);
