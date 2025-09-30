const AdCount = require("../models/AdCount");

const checkAdLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let adStats = await AdCount.findOne({ userId, month, year });

    if (!adStats) {
      adStats = await AdCount.create({ userId, month, year });
    }

    // Check if paid plan is active
   const hasPaidPlan = adStats.paidPlanExpiry
  ? adStats.paidPlanExpiry > now // still valid
  : adStats.paidAdsLimit > adStats.paidAdsPosted;

    // Allow posting if free ads left OR paid plan is active
    if (adStats.freeAdsPosted < adStats.freeAdsLimit || hasPaidPlan) {
      req.adStats = adStats;
      return next();
    }

    // Otherwise block and redirect to billing
    return res.status(403).json({
      message: "Ad limit reached. Please select a plan to continue.",
      redirectTo: "/billing",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error checking ad limit" });
  }
};

module.exports = checkAdLimit;
