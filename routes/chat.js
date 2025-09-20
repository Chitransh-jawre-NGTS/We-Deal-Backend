const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/auth");

// Marketplace Chat APIs
router.post("/findOrCreateChatByProduct/:productId", authMiddleware, chatController.findOrCreateChatByProduct);
router.get("/chats", authMiddleware, chatController.getUserChats);

// Messages
router.get("/:chatId/messages", authMiddleware, chatController.getMessages);
router.post("/:chatId/messages", authMiddleware, chatController.sendMessage); // ✅ Add this
// Delete a chat by ID
router.delete("/:chatId", authMiddleware, chatController.deleteChat);

module.exports = router;
