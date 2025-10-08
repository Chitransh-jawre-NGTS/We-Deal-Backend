// // models/UserProfile.js
// const mongoose = require("mongoose");

// const userProfileSchema = new mongoose.Schema({
//   authUserId: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
//   name: { type: String, default: "" },
//   phone: { type: String, unique: true, sparse: true },
//   aadhaarNumber: { type: String, unique: true, sparse: true },
//   avatar: { type: String, default: "" },
//   verified: { type: Boolean, default: false },
//   isActive: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now },
// });

// // Optional: auto-verify if all fields filled
// userProfileSchema.pre("save", function (next) {
//   const user = this;
//   if (user.phone && user.name && user.aadhaarNumber && user.avatar) {
//     user.verified = true;
//   } else {
//     user.verified = false;
//   }
//   next();
// });

// module.exports = mongoose.model("UserProfile", userProfileSchema);


// models/UserProfile.js
const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  authUserId: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
  name: { type: String, default: "" },
  phone: { type: String, unique: true, sparse: true },
  aadhaarNumber: { type: String, unique: true, sparse: true },
  avatar: { type: String, default: "" },
  verified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

userProfileSchema.pre("save", function (next) {
  const user = this;
  user.verified = !!(user.phone && user.name && user.aadhaarNumber && user.avatar);
  next();
});

module.exports =
  mongoose.models.UserProfile || mongoose.model("UserProfile", userProfileSchema);
