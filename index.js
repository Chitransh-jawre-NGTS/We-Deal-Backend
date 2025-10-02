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
const cron = require("node-cron");

const MobileAd = require("./models/storeMobile");

// Routes
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/productRoutes");
const wishlistRoutes = require("./routes/wishlist");
const chatRoutes = require("./routes/chat");
const storeRoutes = require("./routes/storeRoutes");
const storeMobileRoutes = require("./routes/storeMobileRoutes");
const locationRoutes = require("./routes/location");
const BannerAdRoutes = require("./routes/BannerAds");

dotenv.config();
const app = express();
app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://we-deal-frontend.vercel.app",
      "https://wedeal.netlify.app",
      "https://wedealsindia.netlify.app/"
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization","x-store-token"],
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
app.use("/api/store", storeRoutes);
app.use("/api/store", storeMobileRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/ads", BannerAdRoutes);



// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://we-deal-frontend.vercel.app",
      "https://wedeal.netlify.app",
      "https://wedealsindia.netlify.app"
    ],
    methods: ["GET", "POST"],
  },
});

// Socket.IO logic
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id; // attach userId to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});


cron.schedule("0 0 * * *", async () => {
  const result = await MobileAd.updateMany(
    { expiresAt: { $lte: new Date() }, status: "Active" },
    { $set: { status: "Deactivated" } }
  );
  console.log(`Deactivated ${result.modifiedCount} expired ads`);
});


io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id, "User:", socket.userId);

  // Join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`📥 User ${socket.userId} joined chat ${chatId}`);
  });

  // Send message
  socket.on("sendMessage", async ({ chatId, text }) => {
    if (!text || !text.trim()) return;

    try {
      const Message = require("./models/message");
      const Chat = require("./models/chat");

      // Save message
      const message = await Message.create({
        chatId,
        sender: socket.userId,
        text: text.trim(),
      });

      // Update lastMessage in chat
      await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

      // Emit message to room
      io.to(chatId).emit("receiveMessage", message);
    } catch (err) {
      console.error("❌ Error saving message:", err);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.userId, "Reason:", reason);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
