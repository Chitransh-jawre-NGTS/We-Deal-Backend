const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/user"); // Your User model

// 🔹 In-memory OTP storage (replace with DB in production)
const otpStore = {}; // { email: { otp, expires, token } }

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Step 1: Send OTP
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // 🔹 Check if email exists in DB
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore[email] = { otp, expires };

    await transporter.sendMail({
      from: `"WeDeals Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
  <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f6f9fc;
    padding: 40px 0;
    text-align: center;
  ">
    <div style="
      max-width: 480px;
      margin: auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
    ">
      <h2 style="color: #2b2d42;">🔐 WeDeals OTP Verification</h2>
      <p style="font-size: 16px; color: #555;">
        Use the following One-Time Password (OTP) to reset your password:
      </p>
      <div style="
        font-size: 32px;
        font-weight: bold;
        color: #007bff;
        letter-spacing: 4px;
        margin: 20px 0;
      ">
        ${otp}
      </div>
      <p style="color: #888; font-size: 14px;">
        This OTP is valid for <strong>5 minutes</strong>. 
        Please do not share it with anyone for your account security.
      </p>
      <hr style="border: none; height: 1px; background-color: #eee; margin: 25px 0;">
      <p style="font-size: 13px; color: #999;">
        Regards, <br>
        <strong>WeDeals Team</strong> <br>
        <a href="https://yourdomain.com" style="color: #007bff; text-decoration: none;">Visit our website</a>
      </p>
    </div>
  </div>
`

    });

    res.json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Step 2: Verify OTP
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  if (!record) return res.status(400).json({ message: "No OTP requested" });
  if (record.expires < Date.now()) return res.status(400).json({ message: "OTP expired" });
  if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  // Generate temporary reset token
  const token = crypto.randomBytes(20).toString("hex");
  otpStore[email].token = token;
  otpStore[email].otp = null; // clear OTP

  res.json({ message: "OTP verified", token });
};

// Step 3: Reset Password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const email = Object.keys(otpStore).find(e => otpStore[e].token === token);

  if (!email) return res.status(400).json({ message: "Invalid token" });

  try {
    // 🔹 Update password in DB (hash before saving)
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword; // In production, hash with bcrypt
    await user.save();

    // Clear token
    delete otpStore[email];

    res.json({ message: "Password reset successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
