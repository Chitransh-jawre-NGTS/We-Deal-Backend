// models/Chat.js
const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // two or more users
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
