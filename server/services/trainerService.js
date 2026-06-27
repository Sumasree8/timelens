const TrainerRound = require('../models/TrainerRound');

class TrainerService {
  /** Record a completed trainer round, computing closeness to the target. */
  async recordRound(userId, targetSeconds, actualSeconds) {
    const target = Math.max(1, Number(targetSeconds) || 0);
    const actual = Math.max(0, Number(actualSeconds) || 0);
    const accuracy = Math.max(0, Math.min(100, 100 * (1 - Math.abs(actual - target) / target)));

    const round = await TrainerRound.create({
      userId,
      targetSeconds: target,
      actualSeconds: parseFloat(actual.toFixed(2)),
      accuracy: parseFloat(accuracy.toFixed(1)),
    });
    return round;
  }

  /** Aggregate stats: totals, best, recent accuracy, and a first-half→second-half improvement. */
  async getStats(userId) {
    const rounds = await TrainerRound.find({ userId }).sort({ createdAt: 1 }).lean();

    if (rounds.length === 0) {
      return { totalRounds: 0, avgAccuracy: 0, bestAccuracy: 0, improvement: 0, recent: [] };
    }

    const accuracies = rounds.map(r => r.accuracy);
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

    const avgAccuracy = parseFloat(avg(accuracies).toFixed(1));
    const bestAccuracy = parseFloat(Math.max(...accuracies).toFixed(1));

    // Improvement: mean accuracy of the second half minus the first half.
    let improvement = 0;
    if (rounds.length >= 4) {
      const mid = Math.floor(accuracies.length / 2);
      improvement = parseFloat((avg(accuracies.slice(mid)) - avg(accuracies.slice(0, mid))).toFixed(1));
    }

    const recent = rounds.slice(-20).map(r => ({
      targetSeconds: r.targetSeconds,
      actualSeconds: r.actualSeconds,
      accuracy: r.accuracy,
      createdAt: r.createdAt,
    }));

    return { totalRounds: rounds.length, avgAccuracy, bestAccuracy, improvement, recent };
  }
}

module.exports = new TrainerService();
