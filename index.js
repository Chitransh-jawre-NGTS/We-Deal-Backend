// const express = require("express");
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const http = require("http");            // 👈 needed for socket.io
// const { Server } = require("socket.io"); // 👈 socket.io

// // Routes
// const authRoutes = require("./routes/auth");
// const productRoutes = require("./routes/productRoutes");
// const wishlistRoutes = require("./routes/wishlist");
// const chatRoutes = require("./routes/chat"); // 👈 new chat routes

// dotenv.config();
// const app = express();
// app.use(express.json());

// // ✅ Enable CORS
// app.use(
//   cors({
//     origin: [
//       "http://localhost:5173",
//       "https://we-deal-frontend.vercel.app", // 👈 replace with your frontend domain
//     ],
//      credentials: true, // allow cookies
//   allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // MongoDB connection
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("✅ MongoDB Connected"))
//   .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api", productRoutes);
// app.use("/api", wishlistRoutes);
// app.use("/api", chatRoutes); // 👈 chat REST API

// // Create HTTP server for socket.io
// const server = http.createServer(app);

// // ✅ Setup Socket.IO
// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://we-deal-frontend.vercel.app", // 👈 frontend domain
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("⚡ New client connected:", socket.id);

//   // Join a chat room
//   socket.on("joinChat", (chatId) => {
//     socket.join(chatId);
//     console.log(`📥 User ${socket.id} joined chat ${chatId}`);
//   });

//   // Handle sending messages
//   socket.on("sendMessage", async ({ chatId, sender, text }) => {
//     try {
//       const Message = require("./models/message");
//       const Chat = require("./models/chat");

//       const message = await Message.create({ chatId, sender, text });
//       await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

//       io.to(chatId).emit("receiveMessage", message); // send to all users in chat room
//     } catch (err) {
//       console.error("❌ Error saving message:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ User disconnected:", socket.id);
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlist");
const chatRoutes = require("./routes/chat");

dotenv.config();
const app = express();
app.use(express.json());

// Enable CORS for REST APIs
app.use(
  cors({
    origin: [
      "http://localhost:5173",          // local dev
      "https://we-deal-frontend.vercel.app", // vercel
      "https://wedeal.netlify.app",     // netlify (your live site)
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api", productRoutes);
app.use("/api", wishlistRoutes);
app.use("/api", chatRoutes);

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO with same CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://we-deal-frontend.vercel.app",
      "https://wedeal.netlify.app",
    ],
    methods: ["GET", "POST"],
  },
});

// Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // ✅ Extract token from handshake auth
  const token = socket.handshake.auth?.token;
  if (!token) return socket.disconnect();

  let userId;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.id;
  } catch (err) {
    console.log("❌ Invalid token, disconnecting:", socket.id);
    return socket.disconnect();
  }

  // Join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`📥 User ${userId} joined chat ${chatId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ chatId, text }) => {
    try {
      const Message = require("./models/message");
      const Chat = require("./models/chat");

      // ✅ Save message with authenticated userId
      const message = await Message.create({
        chatId,
        sender: userId,
        text,
      });

      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

      io.to(chatId).emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", userId);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
