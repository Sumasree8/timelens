const Challenge = require('../models/Challenge');
const Session = require('../models/Session');

const hourBracket = (h) => (h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 22 ? 'evening' : 'night');
const valueOf = (session, dimension) => (
  dimension === 'timeOfDay' ? hourBracket(new Date(session.createdAt).getHours()) : session[dimension]
);
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

class ChallengeService {
  /** Start a new experiment, abandoning any currently-active one. */
  async create(userId, { dimension, valueA, valueB, targetPer = 5 }) {
    await Challenge.updateMany({ userId, status: 'active' }, { status: 'abandoned' });
    return Challenge.create({ userId, dimension, valueA, valueB, targetPer });
  }

  /** Active experiment with live progress + result (auto-completes when both sides hit target). */
  async getActive(userId) {
    const challenge = await Challenge.findOne({ userId, status: 'active' }).lean();
    if (!challenge) return { active: false };

    const sessions = await Session.find({
      userId, completed: true, createdAt: { $gte: challenge.createdAt },
    }).lean();

    const sideA = sessions.filter((s) => String(valueOf(s, challenge.dimension)) === challenge.valueA);
    const sideB = sessions.filter((s) => String(valueOf(s, challenge.dimension)) === challenge.valueB);

    const progress = {
      a: { value: challenge.valueA, count: sideA.length, avgFlow: Math.round(mean(sideA.map((s) => s.flowScore || 0))) },
      b: { value: challenge.valueB, count: sideB.length, avgFlow: Math.round(mean(sideB.map((s) => s.flowScore || 0))) },
      targetPer: challenge.targetPer,
    };

    let result = null;
    if (sideA.length >= challenge.targetPer && sideB.length >= challenge.targetPer) {
      const winner = progress.a.avgFlow === progress.b.avgFlow ? null : (progress.a.avgFlow > progress.b.avgFlow ? 'a' : 'b');
      const win = winner === 'a' ? progress.a : progress.b;
      const lose = winner === 'a' ? progress.b : progress.a;
      const delta = winner ? Math.round(((win.avgFlow - lose.avgFlow) / Math.max(lose.avgFlow, 1)) * 100) : 0;
      result = {
        winner: winner ? win.value : 'tie',
        delta,
        headline: winner ? `${cap(win.value)} wins — ${delta}% more flow than ${lose.value}` : 'It’s a tie — both gave you similar flow',
      };
      await Challenge.updateOne({ _id: challenge._id }, { status: 'complete' });
    }

    return { active: true, challenge, progress, result };
  }

  async abandon(userId) {
    await Challenge.updateMany({ userId, status: 'active' }, { status: 'abandoned' });
    return { success: true };
  }
}

function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

module.exports = new ChallengeService();
