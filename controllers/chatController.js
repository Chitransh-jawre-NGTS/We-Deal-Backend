const Chat = require("../models/chat");
const Message = require("../models/message");
const Product = require("../models/product");

// ✅ Create or find chat for a product (buyer ↔ seller)
exports.findOrCreateChatByProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (!product.sellerId)
      return res.status(400).json({ message: "Product has no seller assigned" });

    // Ensure chat exists
    let chat = await Chat.findOne({
      product: productId,
      participants: { $all: [userId, product.sellerId] },
    });

    if (!chat) {
      chat = await Chat.create({
        product: productId,
        participants: [userId, product.sellerId],
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get all chats of logged-in user (works for buyer & seller)
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name") // we don’t need avatar now
      .populate("lastMessage", "text")
      .populate("product", "title price images")
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => {
      // ✅ define otherUser here
      const otherUser = chat.participants.find(
        p => p._id.toString() !== userId.toString()
      );

      return {
        _id: chat._id,
        name: otherUser?.name || "Unknown",        // show sender name
        avatar: chat.product?.images?.[0] || null, // show first product image
        lastMessage: chat.lastMessage || null,
        product: chat.product || null,
        participants: chat.participants,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      };
    });

    res.status(200).json(formattedChats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};


// ✅ Get all messages in a chat
exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).populate("sender", "name avatar");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text?.trim())
      return res.status(400).json({ message: "Message text is required" });

    const message = await Message.create({ chatId, sender: userId, text });

    // Update lastMessage in chat so both participants see it
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });

    res.status(201).json(message);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};



// const Chat = require("../models/chat");
// const Message = require("../models/message");
// const Product = require("../models/product");

// // ✅ Create or find chat for a product (buyer ↔ seller)
// // Create or find chat
// exports.findOrCreateChatByProduct = async (req, res) => {
//   try {
//     const userId = req.user._id; // current user
//     const productId = req.params.productId;

//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     // Ensure participants array always includes both seller and buyer
//     let chat = await Chat.findOne({
//       product: productId,
//       participants: { $all: [userId, product.sellerId] },
//     });

//     if (!chat) {
//       chat = await Chat.create({
//         product: productId,
//         participants: [userId, product.sellerId], // both participants
//       });
//     }

//     res.status(200).json(chat);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Send a message and update lastMessage
// exports.sendMessage = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { text } = req.body;
//     const userId = req.user._id;

//     if (!text || !text.trim()) return res.status(400).json({ message: "Message required" });

//     const message = await Message.create({ chatId, sender: userId, text });

//     // Update lastMessage in chat so both participants see it
//     await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id, updatedAt: new Date() });

//     res.status(201).json(message);
//   } catch (err) {
//     console.error("sendMessage error:", err);
//     res.status(500).json({ message: "Failed to send message" });
//   }
// };


// // ✅ Get all chats of logged-in user
// exports.getUserChats = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const chats = await Chat.find({ participants: userId })
//       .populate("participants", "name avatar") // get participant name & avatar
//       .populate("lastMessage", "text")
//       .populate("product", "title price images")
//       .sort({ updatedAt: -1 });

//     const formattedChats = chats.map(chat => {
//       const otherUser = chat.participants.find(
//         (p) => p._id.toString() !== userId.toString()
//       );
//       return {
//         _id: chat._id,
//         name: otherUser?.name || "Unknown",
//         avatar: otherUser?.avatar || null,
//         lastMessage: chat.lastMessage || null,
//         product: chat.product || null,
//         participants: chat.participants,
//         createdAt: chat.createdAt,
//         updatedAt: chat.updatedAt,
//       };
//     });

//     res.status(200).json(formattedChats);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch chats" });
//   }
// };

// // ✅ Get all messages for a chat
// exports.getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const messages = await Message.find({ chatId }).populate("sender", "name avatar");
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Send a new message


