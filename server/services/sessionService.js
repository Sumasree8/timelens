const Session = require('../models/Session');
const User = require('../models/User');
const { computePerception } = require('../utils/perception');

class SessionService {
  /**
   * Start a focus session. The clock is hidden on the client from here on —
   * we only record what the user is doing and how they feel.
   */
  async startSession(userId, context = {}) {
    const { activity, stateTag = null, environment = null, music = null, energy = null, sleepHours = null, plannedMinutes = null } = context;
    const session = await Session.create({
      userId, activity, stateTag, environment, music, energy, sleepHours, plannedMinutes,
    });
    // The experiment number is this user's lifetime session count.
    const experimentNumber = await Session.countDocuments({ userId });
    return { session, experimentNumber };
  }

  /**
   * End a session with the REAL elapsed time and the user's blind estimate.
   * Perception metrics are measured from those two numbers — never invented.
   */
  async endSession(sessionId, userId, actualSeconds, estimatedSeconds) {
    const { ratio, accuracy, direction, flowScore } = computePerception(actualSeconds, estimatedSeconds);

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      {
        actualSeconds,
        estimatedSeconds,
        perceptionRatio: ratio,
        accuracy,
        direction,
        flowScore,
        completed: true,
      },
      { new: true }
    );

    if (!session) throw new Error('Session not found');

    await this._updateUserStreak(userId);

    return session;
  }

  async saveReflection(sessionId, userId, reflection) {
    const session = await Session.findOneAndUpdate(
      { _id: sessionId, userId },
      { reflection: String(reflection || '').slice(0, 280) },
      { new: true }
    );
    if (!session) throw new Error('Session not found');
    return session;
  }

  async getUserSessions(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      Session.find({ userId, completed: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Session.countDocuments({ userId, completed: true }),
    ]);

    return { sessions, total, page };
  }

  async _updateUserStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }

    user.lastActiveDate = new Date();
    await user.save();
  }
}

module.exports = new SessionService();
