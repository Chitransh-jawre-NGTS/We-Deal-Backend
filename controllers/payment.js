const Payment = require("../models/payment");
const AdCount = require("../models/AdCount");
const mongoose = require("mongoose");

// ⚡ Map fake planId strings to static ObjectIds
const planMap = {
  BASE_PLAN_ID: new mongoose.Types.ObjectId("64f123456789abcdef012345"),     // 24 chars
  PREMIUM_PLAN_ID: new mongoose.Types.ObjectId("64f123456789abcdef012346"),  // 24 chars
};

// Generate fake order ID
function generateOrderId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORDER-${date}-${randomNum}`;
}

// Activate plan for user
const activatePlanForUser = async (userId, planId, role) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let adStats = await AdCount.findOne({ userId, month, year });
  if (!adStats) adStats = await AdCount.create({ userId, month, year });

  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  // Activate plan based on planId
  if (role === "seller") {
    if (planId.toString() === planMap.BASE_PLAN_ID.toString()) adStats.baseAdsLimit += 1;
    else if (planId.toString() === planMap.PREMIUM_PLAN_ID.toString()) adStats.baseAdsLimit = 100;
  } else {
    if (planId.toString() === planMap.BASE_PLAN_ID.toString()) adStats.baseAdsLimit += 1;
    else if (planId.toString() === planMap.PREMIUM_PLAN_ID.toString()) adStats.premiumAdsLimit += 1;
  }

  adStats.paidPlanExpiry = expiryDate;
  await adStats.save();
};

// Create order & activate plan
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, role } = req.body;

    const objectPlanId = planMap[planId];
    if (!objectPlanId) return res.status(400).json({ message: "Invalid plan type" });

    const plan = {
      _id: objectPlanId,
      name: planId === "BASE_PLAN_ID" ? "Base Plan" : "Premium Plan",
      amount: planId === "BASE_PLAN_ID" ? 19 : 49,
      totalAmount: planId === "BASE_PLAN_ID" ? 19 : 49,
    };

    const orderId = generateOrderId();

    const payment = await Payment.create({
      userId,
      role,
      planId: plan._id,
      amount: plan.amount,
      totalAmount: plan.totalAmount,
      razorpayOrderId: orderId,
      razorpayPaymentId: `PAY-${Date.now()}`,
      razorpaySignature: `SIGN-${Math.random().toString(36).substring(2, 15)}`,
      status: "completed",
    });

    await activatePlanForUser(userId, plan._id, role);

    res.status(200).json({ message: "Order created and plan activated", payment, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};

// Get all transactions (for admin)
exports.getAllTransactions = async (req, res) => {
  try {
    // Optional: you can filter by user, role, or date later
    const payments = await Payment.find()
      .populate("userId", "name email") // populate user info
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions", error: err.message });
  }
};

// Get transactions for a single user
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId })
      .populate("planId", "name amount totalAmount")
      .sort({ createdAt: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user transactions", error: err.message });
  }
};
