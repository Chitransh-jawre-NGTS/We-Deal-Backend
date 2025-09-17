const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product"); // ✅ Added
const Chat = require("../models/chat");       // ✅ Added

// Create/Get chat
router.post("/create", authMiddleware, chatController.createChat);
router.get("/chats", authMiddleware, chatController.getUserChats);

// Messages
router.post("/:chatId/messages", authMiddleware, chatController.getMessages);
router.post("/findOrCreateChatByProduct/:productId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id; // logged-in user
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check if chat exists for this product and user
    let chat = await Chat.findOne({
      product: productId,
      users: userId,
    });

    if (!chat) {
      chat = await Chat.create({
        product: productId,
        users: [userId, product.sellerId], // assuming product has sellerId
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
