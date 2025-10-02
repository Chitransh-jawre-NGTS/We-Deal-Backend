const AdCount = require("../models/AdCount");

const checkAdLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const planType = req.body?.planType || "base"; // ✅ optional chaining
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await AdCount.findOne({ userId, month, year });
    if (!adStats) {
      adStats = await AdCount.create({ userId, month, year });
    }

    if (planType === "premium") {
      const hasPaidPlan = adStats.paidPlanExpiry && adStats.paidPlanExpiry > now;
      const paidAdsLeft = hasPaidPlan ? (adStats.premiumAdsLimit || 0) - (adStats.premiumAdsPosted || 0) : 0;

      if (!hasPaidPlan || paidAdsLeft <= 0) {
        return res.status(403).json({
          message: "No paid ads left. Please activate a paid plan.",
          redirectTo: "/billing",
        });
      }
    } else {
      const freeAdsLeft = (adStats.freeAdsLimit || 0) - (adStats.freeAdsPosted || 0);
      if (freeAdsLeft <= 0) {
        return res.status(403).json({
          message: "No free ads left. Please activate a paid plan.",
          redirectTo: "/billing",
        });
      }
    }

    req.adStats = adStats;
    next();
  } catch (err) {
    console.error("Error in checkAdLimit middleware:", err);
    res.status(500).json({ message: "Error checking ad limit", error: err.message });
  }
};

module.exports = checkAdLimit;
