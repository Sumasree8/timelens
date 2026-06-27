const TrainerService = require('../services/trainerService');

const recordRound = async (req, res, next) => {
  try {
    const { targetSeconds, actualSeconds } = req.body;
    const round = await TrainerService.recordRound(req.user._id, targetSeconds, actualSeconds);
    res.status(201).json({ success: true, round });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const stats = await TrainerService.getStats(req.params.userId);
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
};

module.exports = { recordRound, getStats };
