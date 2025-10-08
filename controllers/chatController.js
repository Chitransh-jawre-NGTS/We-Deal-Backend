// controllers/chatController.js
const Chat = require("../models/chat");
const Message = require("../models/message");
const Product = require("../models/product");
const UserProfile = require("../models/UserProfile");

// ✅ Create or find chat for a product (buyer ↔ seller)
exports.findOrCreateChatByProduct = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const productId = req.params.productId;

    // Ensure product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (!product.sellerId) return res.status(400).json({ message: "Product has no seller assigned" });

    // Get UserProfiles for buyer & seller
    const buyerProfile = await UserProfile.findOne({ authUserId });
    const sellerProfile = await UserProfile.findOne({ authUserId: product.sellerId });

    if (!buyerProfile || !sellerProfile) {
      return res.status(404).json({ message: "Buyer or seller profile not found" });
    }

    // Prevent seller from chatting with themselves
    if (buyerProfile._id.equals(sellerProfile._id)) {
      return res.status(400).json({ message: "You cannot start a chat with yourself" });
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      product: productId,
      participants: { $all: [buyerProfile._id, sellerProfile._id] },
    });

    // If not found, create new chat
    if (!chat) {
      chat = await Chat.create({
        product: productId,
        participants: [buyerProfile._id, sellerProfile._id],
      });
    }

    await chat.populate("product", "title price images");
    res.status(200).json(chat);
  } catch (err) {
    console.error("findOrCreateChatByProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all chats of logged-in user
exports.getUserChats = async (req, res) => {
  try {
    const authUserId = req.user._id;
    const userProfile = await UserProfile.findOne({ authUserId });
    if (!userProfile) return res.status(404).json({ message: "UserProfile not found" });

    const chats = await Chat.find({ participants: userProfile._id })
      .populate("lastMessage", "text createdAt")
      .populate("product", "title price images")
      .sort({ updatedAt: -1 });

    // Fetch other participant info
    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.participants.find((p) => !p.equals(userProfile._id));
        const otherUser = await UserProfile.findById(otherUserId).select("name avatar");

        return {
          _id: chat._id,
          otherUser: {
            _id: otherUser?._id,
            name: otherUser?.name || "Unknown",
            avatar: otherUser?.avatar || null,
          },
          lastMessage: chat.lastMessage || null,
          product: chat.product || null,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      })
    );

    res.status(200).json(formattedChats);
  } catch (err) {
    console.error("getUserChats error:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// ✅ Get all messages in a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const authUserId = req.user._id;
    const userProfile = await UserProfile.findOne({ authUserId });
    if (!userProfile) return res.status(404).json({ message: "UserProfile not found" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (!chat.participants.includes(userProfile._id)) {
      return res.status(403).json({ message: "Not authorized to view this chat" });
    }

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await UserProfile.findById(msg.sender).select("name avatar");
        return { ...msg.toObject(), sender };
      })
    );

    res.status(200).json(populatedMessages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// ✅ Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Message text is required" });

    const authUserId = req.user._id;
    const userProfile = await UserProfile.findOne({ authUserId });
    if (!userProfile) return res.status(404).json({ message: "UserProfile not found" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (!chat.participants.includes(userProfile._id)) {
      return res.status(403).json({ message: "Not authorized to send message in this chat" });
    }

    const message = await Message.create({
      chatId,
      sender: userProfile._id,
      text: text.trim(),
    });

    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    const populatedMessage = await message.populate("sender", "name avatar");

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// ✅ Delete chat (secure)
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const authUserId = req.user._id;
    const userProfile = await UserProfile.findOne({ authUserId });
    if (!userProfile) return res.status(404).json({ message: "UserProfile not found" });

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (!chat.participants.includes(userProfile._id)) {
      return res.status(403).json({ message: "Not authorized to delete this chat" });
    }

    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat and messages deleted successfully" });
  } catch (err) {
    console.error("deleteChat error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
