// const mongoose = require("mongoose");

// function arrayLimit(val) {
//   return val.length <= 8;
// }

// const productSchema = new mongoose.Schema({
//   category: { type: String, required: true },
//   fields: { type: Object, required: true }, 
//   images: { type: [String], validate: [arrayLimit, "{PATH} exceeds the limit of 8"] },
//   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   createdAt: { type: Date, default: Date.now },
//   expiryDate: { type: Date, default: null }, // expire 1 day later
//   status: { type: String, enum: ["active", "expired"], default: "active" },

//   // ✅ Add location field
//   location: {
//     type: {
//       type: String,
//       enum: ["Point"], // Must be "Point"
//       default: "Point",
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       required: true,
//     },
//   },
// });

// // ✅ Index for geospatial queries
// productSchema.index({ location: "2dsphere" });

// module.exports = mongoose.model("Product", productSchema);


const mongoose = require("mongoose");

function arrayLimit(val) {
  return val.length <= 3; // Max 8 images allowed
}

const productSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },

    // Store extra details dynamically (like title, description, price, etc.)
    fields: { type: Object, required: true },

    // Product images
    images: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 8"],
    },

    // User who posted the product
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Location data (GeoJSON format)
    location: {
      type: {
        type: String,
        enum: ["Point"], // Required by GeoJSON
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Status handling
    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    // Expiry date (default: 30 days from creation)
    expiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  {
    timestamps: true, // auto adds createdAt & updatedAt
  }
);

// ✅ Index for fast location queries
productSchema.index({ location: "2dsphere" });

// Auto-expire middleware
productSchema.pre("save", function (next) {
  if (!this.expiryDate) {
    this.expiryDate = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000); // Default 30 days
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
