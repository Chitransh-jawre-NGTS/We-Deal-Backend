const mongoose = require("mongoose");

const adCountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Free ads posted this month
  freeAdsPosted: { type: Number, default: 0 },
  freeAdsLimit: { type: Number, default: 5 },

  // Paid ads
  paidAdsPosted: { type: Number, default: 0 },
  paidAdsLimit: { type: Number, default: 0 },      // total ads allowed in plan
  paidPlanExpiry: { type: Date },                  // expiry for paid plan

  // Month/Year of count
  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });

// Ensure one document per user per month
adCountSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("AdCount", adCountSchema);
