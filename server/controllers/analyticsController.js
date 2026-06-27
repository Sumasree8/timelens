const AnalyticsService = require('../services/analyticsService');

const getAnalytics = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const analytics = await AnalyticsService.computeAnalytics(userId);
    res.json({ success: true, analytics });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };
