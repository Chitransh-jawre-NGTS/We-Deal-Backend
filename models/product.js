const mongoose = require("mongoose");

function arrayLimit(val) {
  return val.length <= 8;
}

const productSchema = new mongoose.Schema({
  category: { type: String, required: true },
  fields: { type: Object, required: true }, // {Brand: "Apple", Model: "iPhone 15", Price: "90000"}
  images: { type: [String], validate: [arrayLimit, '{PATH} exceeds the limit of 8'] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
