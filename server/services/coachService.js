const Session = require('../models/Session');
const { buildStreaks, buildWeeklyStory, buildCoach } = require('../utils/coach');

class CoachService {
  /** Streaks, weekly story, and conditions-based coaching from real sessions. */
  async getCoaching(userId) {
    const sessions = await Session.find({ userId, completed: true }).lean();
    const now = new Date();
    return {
      streaks: buildStreaks(sessions, now),
      weeklyStory: buildWeeklyStory(sessions, now),
      coach: buildCoach(sessions),
    };
  }
}

module.exports = new CoachService();
