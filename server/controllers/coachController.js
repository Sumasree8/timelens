const CoachService = require('../services/coachService');

const getCoaching = async (req, res, next) => {
  try {
    const data = await CoachService.getCoaching(req.params.userId);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCoaching };
