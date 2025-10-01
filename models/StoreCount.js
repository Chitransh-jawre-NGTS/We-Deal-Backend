const storeCountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Free mobile ads
  freeAdsPosted: { type: Number, default: 0 },
  freeAdsLimit: { type: Number, default: 3 },

  // Paid mobile ads
  paidAdsPosted: { type: Number, default: 0 },
  paidAdsLimit: { type: Number, default: 0 },
  paidPlanExpiry: { type: Date },

  // Free store listings
  freeStoresPosted: { type: Number, default: 0 },
  freeStoresLimit: { type: Number, default: 5 },

  // Paid stores
  paidStoresPosted: { type: Number, default: 0 },
  paidStoresLimit: { type: Number, default: 0 },

  month: { type: Number, required: true },
  year: { type: Number, required: true },
}, { timestamps: true });
