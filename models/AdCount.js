const mongoose = require("mongoose");

const adCountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Free ads posted this month
  freeAdsPosted: { type: Number, default: 0 },
  freeAdsLimit: { type: Number, default: 3 },

  // Base ads (paid, non-featured)
  baseAdsPosted: { type: Number, default: 0 },
  baseAdsLimit: { type: Number, default: 0 },

  // Premium ads (paid, featured)
  premiumAdsPosted: { type: Number, default: 0 },
  premiumAdsLimit: { type: Number, default: 0 },

  // Paid plan expiry (applies to both base & premium)
  paidPlanExpiry: { type: Date },

  // Month/Year of count
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

// Ensure one document per user per month
adCountSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("AdCount", adCountSchema);
