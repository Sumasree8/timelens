const SessionService = require('../services/sessionService');

const startSession = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { session, experimentNumber } = await SessionService.startSession(userId, req.body);
    res.status(201).json({ success: true, sessionId: session._id, experimentNumber, startedAt: session.createdAt });
  } catch (err) {
    next(err);
  }
};

const endSession = async (req, res, next) => {
  try {
    const { sessionId, actualSeconds, estimatedSeconds } = req.body;
    const session = await SessionService.endSession(sessionId, req.user._id, actualSeconds, estimatedSeconds);
    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

const saveReflection = async (req, res, next) => {
  try {
    const { sessionId, reflection } = req.body;
    const session = await SessionService.saveReflection(sessionId, req.user._id, reflection);
    res.json({ success: true, session });
  } catch (err) {
    next(err);
  }
};

const getUserSessions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await SessionService.getUserSessions(id, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

module.exports = { startSession, endSession, saveReflection, getUserSessions };
