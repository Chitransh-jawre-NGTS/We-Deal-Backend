// const User = require("../models/user");
// const Otp = require("../models/otp");
// const jwt = require("jsonwebtoken");

// // ✅ Send OTP
// // ✅ Send OTP
// exports.sendOtp = async (req, res) => {
//   console.log("Request Body:", req.body); // Debugging
//   try {
//     const { phone } = req.body;
//     if (!phone) {
//       return res.status(400).json({ message: "Phone is required" });
//     }

//     // Generate 6-digit OTP
//     const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

//     // Expire in 5 mins
//     const otp = new Otp({
//       phone,
//       otp: otpCode,
//       expiresAt: new Date(Date.now() + 5 * 60 * 1000),
//     });

//     await otp.save();

//     // ✅ Return OTP in response
//     return res.json({
//       message: "OTP sent successfully",
//       otp: otpCode,   // <--- IMPORTANT
//     });
//   } catch (err) {
//     console.error("❌ Error sending OTP:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };


// // ✅ Verify OTP
// exports.verifyOtp = async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) {
//       return res
//         .status(400)
//         .json({ message: "Phone and OTP are required" });
//     }

//     const otpRecord = await Otp.findOne({ phone, otp });
//     if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

//     if (otpRecord.expiresAt < new Date()) {
//       return res.status(400).json({ message: "OTP expired" });
//     }

//     // OTP is valid, delete it
//     await Otp.deleteOne({ _id: otpRecord._id });

//     // Check if user exists
//     let user = await User.findOne({ phone });
//     if (!user) {
//       user = await User.create({ phone });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "7d",
//     });

//     res.json({ message: "Login successful", token, user });
//   } catch (err) {
//     console.error("❌ Error verifying OTP:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
// exports.updateProfile = async (req, res) => {
//   console.log("hit update id ")
//   try {
//     const userId = req.params.id; // user ID from route param or JWT
//     const { name, email, aadhaarNumber } = req.body;

//     // Optional avatar file
//     const avatarUrl = req.file ? req.file.path : undefined;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         name,
//         email,
//         aadhaarNumber,
//         ...(avatarUrl && { avatar: avatarUrl }),
//       },
//       { new: true }
//     );

//     res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getProfile = async (req, res) => {
//   try {
//     const userId = req.user?._id; // get user ID from middleware
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const user = await User.findById(userId).select("-__v");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json(user);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// exports.deleteAccount = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     await User.findByIdAndDelete(userId);
//     return res.status(200).json({ message: "Account deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting account:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.deactivateAccount = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { isActive: false },
//       { new: true }
//     );
//     return res
//       .status(200)
//       .json({ message: "Account deactivated successfully", user: updatedUser });
//   } catch (err) {
//     console.error("❌ Error deactivating account:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };














const admin = require("../firebaseAdmin"); // initialized Firebase Admin SDK
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const  UserProfile = require("../models/userprofile");

exports.loginWithFirebase = async (req, res) => {
  try {
    const { firebaseToken } = req.body;
    if (!firebaseToken)
      return res.status(400).json({ message: "Firebase token required" });

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name } = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Only include fields that exist
      const userData = { firebaseUid: uid };
      if (email) userData.email = email;
      if (name) userData.name = name; // optional

      user = await User.create(userData);
    }

    // Generate backend JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile
// ✅ Update profile
exports.updateProfile = async (req, res) => {
  try {
    const authUserId = req.user._id; // safer to get from JWT/auth middleware
    const { name, aadhaarNumber, phone } = req.body; 
    const avatarUrl = req.file ? req.file.path : undefined;

    // Debug log
    console.log("Updating profile:", { authUserId, name, aadhaarNumber, phone, avatarUrl });

    // Update profile, create if not exist (upsert)
    const updatedProfile = await UserProfile.findOneAndUpdate(
      { authUserId },
      {
        name,
        aadhaarNumber,
        phone,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Error updating profile:", err);

    // Check for duplicate key error (phone/aadhaar)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        message: `Duplicate value found for ${field}. Please use a different ${field}.`,
      });
    }

    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ✅ Get profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Fetch User
    const user = await User.findById(userId).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch UserProfile linked to this User
    const userProfile = await UserProfile.findOne({ authUserId: userId }).select("-__v");

    res.json({
      user,
      profile: userProfile || null, // in case profile is not created yet
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// ✅ Delete account
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting account:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Deactivate account
exports.deactivateAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    res.status(200).json({ message: "Account deactivated successfully", user: updatedUser });
  } catch (err) {
    console.error("❌ Error deactivating account:", err);
    res.status(500).json({ message: "Server error" });
  }
};
