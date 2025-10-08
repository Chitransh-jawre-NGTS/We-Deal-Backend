const mongoose = require("mongoose");

const productPaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    role: { type: String, enum: ["user"], required: true }, // Only buyer role

    orderId: { type: String, required: true },
    paymentId: { type: String },
    signature: { type: String },

    baseAmount: { type: Number, required: true },
    gst: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "on_hold", "success", "refunded", "failed"],
      default: "pending",
    },

    holdUntil: { type: Date }, // e.g., 7 days from purchase
    refundEligible: { type: Boolean, default: false },

    paymentMethod: { type: String, default: "manual" },

    transactionDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productPaymentSchema.pre("save", function (next) {
  // Automatically set hold for 7 days
  if (!this.holdUntil) {
    const holdDays = 7;
    this.holdUntil = new Date(Date.now() + holdDays * 24 * 60 * 60 * 1000);
    if (this.status === "pending") this.status = "on_hold";
  }
  next();
});

module.exports = mongoose.model("ProductPayment", productPaymentSchema);
