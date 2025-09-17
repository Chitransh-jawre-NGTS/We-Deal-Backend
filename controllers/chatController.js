const Chat = require("../models/chat");
const Message = require("../models/message");

exports.createChat = async (req, res) => {
  try {
    const { userId } = req.body; // person you want to chat with
    const currentUserId = req.user.id;

    let chat = await Chat.findOne({
      participants: { $all: [currentUserId, userId] },
    });

    if (!chat) {
      chat = await Chat.create({ participants: [currentUserId, userId] });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserChats = async (req, res) => {
    console.log("getUserChats API hit");
  try {
    const userId = req.user.id; // from auth middleware
    const chats = await Chat.find({ members: userId }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

exports.getMessages = async (req, res) => {
    console.log("my api hit")
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).populate("sender", "name avatar");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
