// models/Message.js
// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile", required: true }, // ← use correct model
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
