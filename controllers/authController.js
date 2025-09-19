const User = require("../models/user");
const Otp = require("../models/otp");
const jwt = require("jsonwebtoken");

// ✅ Send OTP
// ✅ Send OTP
exports.sendOtp = async (req, res) => {
  console.log("Request Body:", req.body); // Debugging
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expire in 5 mins
    const otp = new Otp({
      phone,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await otp.save();

    // ✅ Return OTP in response
    return res.json({
      message: "OTP sent successfully",
      otp: otpCode,   // <--- IMPORTANT
    });
  } catch (err) {
    console.error("❌ Error sending OTP:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ✅ Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ message: "Phone and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ phone, otp });
    if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid, delete it
    await Otp.deleteOne({ _id: otpRecord._id });

    // Check if user exists
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("❌ Error verifying OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateProfile = async (req, res) => {
  console.log("hit update id ")
  try {
    const userId = req.params.id; // user ID from route param or JWT
    const { name, email, aadhaarNumber } = req.body;

    // Optional avatar file
    const avatarUrl = req.file ? req.file.path : undefined;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        aadhaarNumber,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id; // get user ID from middleware
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
