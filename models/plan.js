const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["user", "seller"], required: true },
  description: { type: String },
  amount: { type: Number, required: true },
  gst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
});

module.exports = mongoose.model("Plan", planSchema);
