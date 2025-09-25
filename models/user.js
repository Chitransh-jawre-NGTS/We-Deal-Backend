// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   phone: {
//     type: String,
//     unique: true,
//     sparse: true, // <-- allow multiple docs without phone
//   },
//   name: {           
//     type: String,
//     default: "",
//   },
//   email: {          
//     type: String,
//     default: "",
//   },
//   avatar: {         
//     type: String,
//     default: "",
//   },
//   aadhaarNumber: {  
//     type: String,
//     unique: true,
//     sparse: true, // <-- allow multiple docs without aadhaarNumber
//     // default removed
//   },
//   verified: {
//     type: Boolean,
//     default: false,
//   },
//   isActive: {
//     type: Boolean,
//     default: true,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// // Pre-save hook to automatically set verified
// userSchema.pre("save", function (next) {
//   const user = this;

//   // verified only if all important fields are filled
//   if (
//     user.phone &&
//     user.name &&
//     user.email &&
//     user.avatar &&
//     user.aadhaarNumber 
//   ) {
//     user.verified = true;
//   } else {
//     user.verified = false;
//   }

//   next();
// });

// module.exports = mongoose.model("User", userSchema);
// models/AuthUser.js



const mongoose = require("mongoose");

const authUserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  firebaseUid: { type: String, unique: true }, // if using Firebase
  password: { type: String }, // optional, for email/password login
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AuthUser", authUserSchema);
