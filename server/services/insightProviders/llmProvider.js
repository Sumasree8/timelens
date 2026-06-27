/**
 * LLM insight provider (Pro tier — gated, optional).
 *
 * This is NOT used on the free tier and costs nothing until a Pro user
 * triggers it with a configured API key. The Anthropic SDK is required
 * lazily so free deployments never need it installed.
 *
 * Freemium model: insightService only selects this provider when
 * user.plan === 'pro' AND isAvailable() returns true. Otherwise the free
 * rule-based provider is used. See [[insightService]].
 */

const MODEL = 'claude-opus-4-8';

// JSON schema the model must conform to — validated at the API layer.
const INSIGHT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    patterns: { type: 'array', items: { type: 'string' } },
    recommendations: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'patterns', 'recommendations'],
};

function isAvailable() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function _loadClient() {
  // Lazy require so the dependency is optional for free-tier deployments.
  // eslint-disable-next-line global-require
  const Anthropic = require('@anthropic-ai/sdk');
  return new Anthropic();
}

function _buildPrompt(analytics, hourLabels) {
  const peak = analytics.peakHour !== null ? hourLabels[analytics.peakHour] : 'unknown';
  return [
    'You are a time-perception coach. Analyse the user\'s MEASURED time-perception data',
    'and produce honest, specific, actionable insights. Only state what the data supports.',
    '',
    'Measured analytics (every number is real, derived from the user comparing their blind',
    'time estimates to actual elapsed time):',
    JSON.stringify({
      totalSessions: analytics.totalSessions,
      chronoceptionAccuracy: analytics.avgAccuracy,
      avgPerceptionRatio: analytics.avgPerceptionRatio,
      compressionRate: analytics.compressionRate,
      expansionRate: analytics.expansionRate,
      peakCompressionTime: peak,
      byActivity: analytics.byActivity,
      byState: analytics.byState,
      consistencyScore: analytics.consistencyScore,
      timeMasteryScore: analytics.timeMasteryScore,
    }, null, 2),
    '',
    'Ratio < 1 means time flew (compressed, flow-like); > 1 means it dragged (expanded).',
    'Return a concise summary, 3-5 detected patterns, and 3-5 recommendations.',
  ].join('\n');
}

async function generate({ analytics, hourLabels }) {
  const client = _loadClient();

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    output_config: { format: { type: 'json_schema', schema: INSIGHT_SCHEMA } },
    messages: [{ role: 'user', content: _buildPrompt(analytics, hourLabels) }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  const parsed = JSON.parse(textBlock.text);

  return {
    summary: parsed.summary,
    patterns: parsed.patterns,
    recommendations: parsed.recommendations,
    source: 'llm',
  };
}

module.exports = { generate, isAvailable };
