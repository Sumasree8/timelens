const InsightService = require('../services/insightService');

const getInsights = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const insight = await InsightService.generateInsights(userId);
    res.json({ success: true, insight });
  } catch (err) {
    next(err);
  }
};

module.exports = { getInsights };
