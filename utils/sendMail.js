const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, message) {
  try {
    const info = await transporter.sendMail({
      from: `"SwapDeals" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
    });

    console.log("✅ Email sent:", info.response);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
}

module.exports = sendMail;
