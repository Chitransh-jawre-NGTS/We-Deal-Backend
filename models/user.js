const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {           // Full name
    type: String,
    default: "",
  },
  email: {          // Email
    type: String,
    default: "",
  },
  avatar: {         // Profile picture URL (Cloudinary)
    type: String,
    default: "",
  },
  aadhaarNumber: {  // Aadhaar number
    type: String,
    default: "",
    unique: true,
    sparse: true, // allows null values to not conflict with unique constraint
  },
  aadhaarDocument: { // Aadhaar image/document URL (Cloudinary)
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
