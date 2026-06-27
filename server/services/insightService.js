const AnalyticsService = require('./analyticsService');
const Insight = require('../models/Insight');
const User = require('../models/User');
const ruleBasedProvider = require('./insightProviders/ruleBasedProvider');
const llmProvider = require('./insightProviders/llmProvider');

const HOUR_LABELS = [
  'midnight', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM',
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  'noon', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM',
  '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

class InsightService {
  /**
   * Generate an insight report from REAL analytics. Provider selection is
   * freemium-aware: free users always get the deterministic rule-based engine
   * (no cost, no API key). Pro users get the LLM provider when it's configured;
   * otherwise we transparently fall back to rule-based.
   */
  async generateInsights(userId) {
    const analytics = await AnalyticsService.computeAnalytics(userId);
    const user = await User.findById(userId);

    if (analytics.totalSessions === 0) {
      return {
        summary: 'No sessions recorded yet. Run your first focus session to start measuring how you perceive time.',
        patterns: [],
        recommendations: ['Complete at least 3 sessions to generate your first perception report.'],
        source: 'rule-based',
        generatedAt: new Date(),
      };
    }

    const provider = this._selectProvider(user);
    let report;
    try {
      report = await provider.generate({ analytics, user, hourLabels: HOUR_LABELS });
    } catch (err) {
      // Never fail the request because a paid provider had a hiccup.
      console.warn(`Insight provider fell back to rule-based: ${err.message}`);
      report = await ruleBasedProvider.generate({ analytics, user, hourLabels: HOUR_LABELS });
    }

    const insight = await Insight.create({
      userId,
      summary: report.summary,
      patterns: report.patterns,
      recommendations: report.recommendations,
      source: report.source || 'rule-based',
      analyticsSnapshot: {
        avgAccuracy: analytics.avgAccuracy,
        avgPerceptionRatio: analytics.avgPerceptionRatio,
        compressionRate: analytics.compressionRate,
        consistencyScore: analytics.consistencyScore,
        peakHour: analytics.peakHour,
        timeMasteryScore: analytics.timeMasteryScore,
      },
    });

    await User.findByIdAndUpdate(userId, { timeMasteryScore: analytics.timeMasteryScore });

    return insight;
  }

  _selectProvider(user) {
    if (user?.plan === 'pro' && llmProvider.isAvailable()) {
      return llmProvider;
    }
    return ruleBasedProvider;
  }
}

module.exports = new InsightService();
