const ChallengeService = require('../services/challengeService');

const create = async (req, res, next) => {
  try {
    const challenge = await ChallengeService.create(req.user._id, req.body);
    res.status(201).json({ success: true, challenge });
  } catch (err) {
    next(err);
  }
};

const getActive = async (req, res, next) => {
  try {
    const data = await ChallengeService.getActive(req.user._id);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

const abandon = async (req, res, next) => {
  try {
    await ChallengeService.abandon(req.user._id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { create, getActive, abandon };
