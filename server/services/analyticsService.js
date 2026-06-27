const Session = require('../models/Session');
const User = require('../models/User');
const { ACTIVITIES } = require('../utils/perception');
const { buildDiscoveries, buildForecast, buildFlowDNA } = require('../utils/flowIntelligence');

class AnalyticsService {
  /**
   * Compute analytics from REAL measured sessions. Every metric traces back
   * to the user's own time estimates vs. real elapsed time.
   */
  async computeAnalytics(userId) {
    const sessions = await Session.find({ userId, completed: true }).lean();

    if (sessions.length === 0) {
      return this._emptyAnalytics();
    }

    const totalSessions = sessions.length;
    const totalActualSeconds = sessions.reduce((sum, s) => sum + (s.actualSeconds || 0), 0);

    // Headline metric: average chronoception accuracy (0–100).
    const avgAccuracy = parseFloat(
      (sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / totalSessions).toFixed(1)
    );

    // Average perception ratio (1.0 = accurate, <1 time flew, >1 dragged).
    const avgPerceptionRatio = parseFloat(
      (sessions.reduce((sum, s) => sum + (s.perceptionRatio || 1), 0) / totalSessions).toFixed(2)
    );

    // Direction rates — how often time compressed vs. expanded.
    const dirCounts = { compressed: 0, calibrated: 0, expanded: 0 };
    sessions.forEach(s => { dirCounts[s.direction] = (dirCounts[s.direction] || 0) + 1; });
    const compressionRate = parseFloat(((dirCounts.compressed / totalSessions) * 100).toFixed(1));
    const expansionRate = parseFloat(((dirCounts.expanded / totalSessions) * 100).toFixed(1));
    const calibratedRate = parseFloat(((dirCounts.calibrated / totalSessions) * 100).toFixed(1));

    const byActivity = this._groupBy(sessions, 'activity', ACTIVITIES);
    const byState = this._groupBy(
      sessions.filter(s => s.stateTag),
      'stateTag'
    );

    // Flow Radar — objective flow detection from time compression.
    const avgFlowScore = parseFloat(
      (sessions.reduce((sum, s) => sum + (s.flowScore || 0), 0) / totalSessions).toFixed(1)
    );
    const flowMatrix = this._computeFlowMatrix(sessions);
    const peakFlowWindow = this._computePeakFlowWindow(sessions);
    const topFlowActivity = this._topFlowActivity(byActivity);

    const peakHour = this._computePeakHour(sessions);
    const consistencyScore = this._computeConsistencyScore(sessions);
    const dailySessions = this._computeDailySessions(sessions);

    // ── Flow Intelligence layer (Brain Atlas, forecast, DNA) ──
    const user = await User.findById(userId).select('streak').lean();
    const discoveries = buildDiscoveries(sessions);
    const focusForecast = buildForecast(sessions, new Date().getHours(), user?.streak || 0, peakFlowWindow, topFlowActivity);
    const flowDNA = buildFlowDNA(sessions);

    // Transparent composite. Half = how well you sense time (accuracy),
    // 30% = engagement (time flying signals flow), 20% = habit consistency.
    const timeMasteryScore = parseFloat((
      avgAccuracy * 0.5 +
      compressionRate * 0.3 +
      consistencyScore * 100 * 0.2
    ).toFixed(1));

    const analytics = {
      totalSessions,
      totalActualSeconds,
      avgAccuracy,
      avgPerceptionRatio,
      compressionRate,
      expansionRate,
      calibratedRate,
      byActivity,
      byState,
      avgFlowScore,
      flowMatrix,
      peakFlowWindow,
      topFlowActivity,
      peakHour,
      consistencyScore: parseFloat(consistencyScore.toFixed(2)),
      timeMasteryScore,
      dailySessions,
      discoveries,
      focusForecast,
      flowDNA,
    };
    analytics.flowType = this._buildFlowType(analytics);
    return analytics;
  }

  /** Aggregate ratio/accuracy per category value (activity or state). */
  _groupBy(sessions, key, allKeys = null) {
    const groups = {};
    sessions.forEach(s => {
      const k = s[key];
      if (!k) return;
      if (!groups[k]) groups[k] = { count: 0, ratioSum: 0, accuracySum: 0, flowSum: 0, totalSeconds: 0 };
      groups[k].count += 1;
      groups[k].ratioSum += s.perceptionRatio || 1;
      groups[k].accuracySum += s.accuracy || 0;
      groups[k].flowSum += s.flowScore || 0;
      groups[k].totalSeconds += s.actualSeconds || 0;
    });

    const result = {};
    const keys = allKeys ? allKeys.filter(k => groups[k]) : Object.keys(groups);
    keys.forEach(k => {
      const g = groups[k];
      result[k] = {
        count: g.count,
        avgRatio: parseFloat((g.ratioSum / g.count).toFixed(2)),
        avgAccuracy: parseFloat((g.accuracySum / g.count).toFixed(1)),
        avgFlow: parseFloat((g.flowSum / g.count).toFixed(1)),
        totalSeconds: g.totalSeconds,
      };
    });
    return result;
  }

  /** Hour of day where time most often compressed (your deep-work window). */
  _computePeakHour(sessions) {
    const hourCounts = new Array(24).fill(0);
    const compressed = sessions.filter(s => s.direction === 'compressed');
    const target = compressed.length > 0 ? compressed : sessions;
    target.forEach(s => {
      const hour = new Date(s.createdAt).getHours();
      hourCounts[hour]++;
    });
    const max = Math.max(...hourCounts);
    return max === 0 ? null : hourCounts.indexOf(max);
  }

  _computeConsistencyScore(sessions) {
    if (sessions.length < 2) return 0.5;

    const dailyCounts = {};
    sessions.forEach(s => {
      const date = new Date(s.createdAt).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const counts = Object.values(dailyCounts);
    if (counts.length < 2) return 0.7;

    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    return Math.max(0, Math.min(1, 1 - stdDev / (mean + 1)));
  }

  /** Last 14 days: session count, focus minutes, and average accuracy per day. */
  _computeDailySessions(sessions) {
    const days = {};
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      days[key] = { date: key, count: 0, totalSeconds: 0, accuracySum: 0 };
    }

    sessions.forEach(s => {
      const key = new Date(s.createdAt).toISOString().split('T')[0];
      if (days[key]) {
        days[key].count++;
        days[key].totalSeconds += s.actualSeconds || 0;
        days[key].accuracySum += s.accuracy || 0;
      }
    });

    return Object.values(days).map(d => ({
      date: d.date,
      count: d.count,
      totalSeconds: d.totalSeconds,
      avgAccuracy: d.count > 0 ? parseFloat((d.accuracySum / d.count).toFixed(1)) : null,
    }));
  }

  /** activity → { hour → avg flowScore } grid for the Flow Radar heatmap. */
  _computeFlowMatrix(sessions) {
    const acc = {};
    sessions.forEach(s => {
      const a = s.activity;
      const h = new Date(s.createdAt).getHours();
      acc[a] = acc[a] || {};
      acc[a][h] = acc[a][h] || { sum: 0, count: 0 };
      acc[a][h].sum += s.flowScore || 0;
      acc[a][h].count += 1;
    });
    const matrix = {};
    Object.entries(acc).forEach(([a, hours]) => {
      matrix[a] = {};
      Object.entries(hours).forEach(([h, v]) => {
        matrix[a][h] = { flow: Math.round(v.sum / v.count), count: v.count };
      });
    });
    return matrix;
  }

  /** The hour with the highest average flow score. */
  _computePeakFlowWindow(sessions) {
    const hours = new Array(24).fill(null).map(() => ({ sum: 0, count: 0 }));
    sessions.forEach(s => {
      const h = new Date(s.createdAt).getHours();
      hours[h].sum += s.flowScore || 0;
      hours[h].count += 1;
    });
    let best = null;
    hours.forEach((v, h) => {
      if (v.count === 0) return;
      const avg = v.sum / v.count;
      if (!best || avg > best.flow) best = { hour: h, flow: Math.round(avg) };
    });
    return best;
  }

  /** Activity with the highest average flow score (needs ≥1 session). */
  _topFlowActivity(byActivity) {
    const entries = Object.entries(byActivity);
    if (entries.length === 0) return null;
    const [key, v] = entries.sort((a, b) => b[1].avgFlow - a[1].avgFlow)[0];
    return { activity: key, flow: v.avgFlow, count: v.count };
  }

  /**
   * Derive a "Flow Type" archetype from measured data — the identity hook.
   * Needs at least 3 sessions; otherwise returns an "unranked" placeholder.
   */
  _buildFlowType(a) {
    if (a.totalSessions < 3) {
      return {
        key: 'unranked', name: 'Unranked', emoji: '🔓',
        tagline: 'Run a few more sessions to reveal your Flow Type.',
        description: `Complete ${3 - a.totalSessions} more session${3 - a.totalSessions === 1 ? '' : 's'} to unlock your time-perception archetype.`,
        traits: [],
      };
    }

    const bracket = this._hourBracket(a.peakFlowWindow ? a.peakFlowWindow.hour : a.peakHour);
    const topAct = a.topFlowActivity ? a.topFlowActivity.activity : null;
    const flow = a.avgFlowScore;
    const accurate = a.avgAccuracy >= 70;

    let name; let emoji; let tagline;
    if (flow >= 55) {
      name = `${this._bracketWord(bracket)} Melter`; emoji = '🌊';
      tagline = `Time dissolves when you're locked in${topAct ? ` — especially during ${topAct}` : ''}.`;
    } else if (a.expansionRate >= 40) {
      name = 'The Marathoner'; emoji = '🐢';
      tagline = 'Time stretches for you — every session feels longer than it is.';
    } else if (accurate) {
      name = 'Clockwork Mind'; emoji = '🕰️';
      tagline = 'An unusually accurate internal clock — you sense time as it really passes.';
    } else {
      name = `${this._bracketWord(bracket)} Drifter`; emoji = '🌗';
      tagline = 'Your sense of time shifts with the work and the hour.';
    }

    const traits = [
      `Peak flow ${bracket}`,
      topAct ? `${topAct} is your strongest flow trigger` : null,
      `${a.compressionRate}% of sessions compressed time`,
      `Chronoception ${a.avgAccuracy}/100`,
    ].filter(Boolean);

    return {
      key: name.toLowerCase().replace(/\s+/g, '-'),
      name, emoji, tagline,
      description: tagline,
      traits,
    };
  }

  _hourBracket(hour) {
    if (hour === null || hour === undefined) return 'anytime';
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  _bracketWord(bracket) {
    return { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night', anytime: 'Allday' }[bracket] || 'Allday';
  }

  _emptyAnalytics() {
    return {
      totalSessions: 0,
      totalActualSeconds: 0,
      avgAccuracy: 0,
      avgPerceptionRatio: 1,
      compressionRate: 0,
      expansionRate: 0,
      calibratedRate: 0,
      byActivity: {},
      byState: {},
      avgFlowScore: 0,
      flowMatrix: {},
      peakFlowWindow: null,
      topFlowActivity: null,
      peakHour: null,
      consistencyScore: 0,
      timeMasteryScore: 0,
      dailySessions: [],
      discoveries: [],
      focusForecast: { ready: false, reason: 'Run your first few sessions to unlock your focus forecast.' },
      flowDNA: { ready: false, traits: [] },
      flowType: {
        key: 'unranked', name: 'Unranked', emoji: '🔓',
        tagline: 'Run your first session to begin.',
        description: 'Complete 3 sessions to unlock your time-perception archetype.',
        traits: [],
      },
    };
  }
}

module.exports = new AnalyticsService();
