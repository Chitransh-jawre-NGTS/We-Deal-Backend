const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  name: {           
    type: String,
    default: "",
  },
  email: {          
    type: String,
    default: "",
  },
  avatar: {         
    type: String,
    default: "",
  },
  aadhaarNumber: {  
    type: String,
    default: null,   // Use null instead of empty string
    unique: true,
    sparse: true,    // Allows multiple nulls
  },
  verified: {
    type: Boolean,
    default: false,
  },
  isActive: {        // <-- New field for deactivation
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to automatically set verified
userSchema.pre("save", function (next) {
  const user = this;

  // verified only if all important fields are filled
  if (
    user.phone &&
    user.name &&
    user.email &&
    user.avatar &&
    user.aadhaarNumber 
  ) {
    user.verified = true;
  } else {
    user.verified = false;
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
