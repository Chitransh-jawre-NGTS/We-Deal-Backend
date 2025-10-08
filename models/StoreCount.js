const mongoose = require("mongoose");

const mobileAdCountSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },

    // Limits
    freeAdsLimit: { type: Number, default: 10 },
    premiumAdsLimit: { type: Number, default: 0 },

    // Usage counters
    freeAdsPosted: { type: Number, default: 0 },
    premiumAdsPosted: { type: Number, default: 0 },

    // Plan expiry
    paidPlanExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MobileAdCount", mobileAdCountSchema);
