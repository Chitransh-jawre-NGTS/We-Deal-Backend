const MobileAdCount = require("../models/StoreCount");

const checkMobileAdLimit = async (req, res, next) => {
  console.log("Store in middleware:", req.store);

  try {
    const userId = req.store.ownerId; // store owner
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Find or create record for this month
    let adStats = await MobileAdCount.findOne({ userId, month, year });
    if (!adStats) {
      adStats = await MobileAdCount.create({ userId, month, year });
    }

    // Check paid plan
    const hasPaidPlan = adStats.paidPlanExpiry
      ? adStats.paidPlanExpiry > now
      : adStats.paidAdsLimit > adStats.paidAdsPosted;

    // Check free or paid availability
    if (adStats.freeAdsPosted < adStats.freeAdsLimit || hasPaidPlan) {
      req.mobileAdStats = adStats;
      return next();
    }

    return res.status(403).json({
      message: "Mobile ad limit reached. Please buy a plan to continue.",
      redirectTo: "/billing",
    });
  } catch (err) {
    console.error("Check mobile ad limit error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkMobileAdLimit;
