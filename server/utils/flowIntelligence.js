/**
 * Flow Intelligence — turns measured sessions into discoveries, a forecast,
 * and a Flow DNA blend. Pure functions (no DB) so they're unit-testable.
 *
 * HONESTY GUARDRAILS:
 *  - A correlation is only surfaced when each compared bucket has at least
 *    MIN_BUCKET sessions, and we always report the sample size.
 *  - Discoveries are framed as patterns OBSERVED IN THE USER'S OWN DATA,
 *    never as proven cause-and-effect, and never as a medical/clinical claim.
 */

const MIN_BUCKET = 3;        // min sessions in a bucket before we compare it
const MIN_FOR_DISCOVERY = 6; // min total sessions before discoveries appear
const MIN_FOR_FORECAST = 5;
const FLOW_DELTA = 12;       // min flow-point gap to call something a discovery

const hourBracket = (h) => {
  if (h === null || h === undefined) return 'anytime';
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
};

const sleepBucket = (h) => {
  if (h == null) return null;
  if (h < 6) return 'under 6h';
  if (h < 7.5) return '6–7.5h';
  return '7.5h+';
};

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const confidenceFor = (n) => (n >= 8 ? 'high' : n >= 5 ? 'medium' : 'low');

/** Generic: bucket sessions by a derived value, return [{value, avgFlow, avgRatio, count}]. */
function bucketize(sessions, getValue) {
  const groups = {};
  sessions.forEach((s) => {
    const v = getValue(s);
    if (v === null || v === undefined) return;
    groups[v] = groups[v] || { flow: [], ratio: [] };
    groups[v].flow.push(s.flowScore || 0);
    groups[v].ratio.push(s.perceptionRatio || 1);
  });
  return Object.entries(groups).map(([value, g]) => ({
    value,
    avgFlow: Math.round(mean(g.flow)),
    avgRatio: parseFloat(mean(g.ratio).toFixed(2)),
    count: g.flow.length,
  }));
}

/**
 * Build "Brain Atlas" discoveries — the strongest flow correlations in the
 * user's data, each with a sample size and confidence level.
 */
function buildDiscoveries(sessions) {
  if (sessions.length < MIN_FOR_DISCOVERY) return [];

  const dims = [
    { key: 'activity', icon: '🎯', getValue: (s) => s.activity, label: (v) => v },
    { key: 'environment', icon: '📍', getValue: (s) => s.environment, label: (v) => v },
    { key: 'music', icon: '🎧', getValue: (s) => s.music, label: (v) => v },
    { key: 'mood', icon: '🫀', getValue: (s) => s.stateTag, label: (v) => `feeling ${v}` },
    { key: 'energy', icon: '🔋', getValue: (s) => s.energy, label: (v) => `${v} energy` },
    { key: 'time of day', icon: '🕐', getValue: (s) => hourBracket(new Date(s.createdAt).getHours()), label: (v) => `the ${v}` },
    { key: 'sleep', icon: '😴', getValue: (s) => sleepBucket(s.sleepHours), label: (v) => `${v} sleep` },
  ];

  const out = [];
  dims.forEach((d) => {
    const buckets = bucketize(sessions, d.getValue).filter((b) => b.count >= MIN_BUCKET);
    if (buckets.length < 2) return;
    buckets.sort((a, b) => b.avgFlow - a.avgFlow);
    const best = buckets[0];
    const rest = buckets.slice(1);
    const restAvg = Math.round(mean(rest.map((b) => b.avgFlow)));
    const delta = best.avgFlow - restAvg;
    if (delta < FLOW_DELTA) return;

    const minN = Math.min(best.count, ...rest.map((b) => b.count));
    const totalN = best.count + rest.reduce((a, b) => a + b.count, 0);
    // Only express as a percentage when the baseline is high enough to be
    // stable; otherwise use flow points (avoids silly "487% more" artifacts).
    const usePct = restAvg >= 25;
    const pctMore = Math.min(150, Math.round((delta / restAvg) * 100));

    out.push({
      id: `${d.key}:${best.value}`,
      icon: d.icon,
      dimension: d.key,
      headline: usePct
        ? `${cap(d.label(best.value))} gives you ${pctMore}% more flow`
        : `${cap(d.label(best.value))} adds +${delta} flow points`,
      detail: `Flow ${best.avgFlow}/100 with ${d.label(best.value)} vs ${restAvg}/100 otherwise · observed across ${totalN} sessions`,
      delta,
      confidence: confidenceFor(minN),
      positive: true,
    });
  });

  // Add a compression discovery for the most time-warping activity.
  const acts = bucketize(sessions, (s) => s.activity).filter((b) => b.count >= MIN_BUCKET);
  if (acts.length) {
    acts.sort((a, b) => a.avgRatio - b.avgRatio);
    const top = acts[0];
    const compression = Math.round((1 - top.avgRatio) * 100);
    if (compression >= 15) {
      out.push({
        id: `compression:${top.value}`,
        icon: '🌀',
        dimension: 'time warp',
        headline: `${cap(top.value)} compresses your sense of time by ${compression}%`,
        detail: `On average ${top.value} feels ${compression}% shorter than it really is · ${top.count} sessions`,
        delta: compression,
        confidence: confidenceFor(top.count),
        positive: true,
      });
    }
  }

  return out.sort((a, b) => b.delta - a.delta).slice(0, 6);
}

/**
 * Focus Forecast — flow probability for the current hour, from the user's
 * history. An estimate from their own data, not a guarantee.
 */
function buildForecast(sessions, nowHour, streak = 0, peakFlowWindow = null, topFlowActivity = null) {
  if (sessions.length < MIN_FOR_FORECAST) {
    return { ready: false, reason: `Run ${MIN_FOR_FORECAST - sessions.length} more sessions to unlock your focus forecast.` };
  }

  const bracket = hourBracket(nowHour);
  const inBracket = sessions.filter((s) => hourBracket(new Date(s.createdAt).getHours()) === bracket);
  const overallFlow = Math.round(mean(sessions.map((s) => s.flowScore || 0)));
  const bracketFlow = inBracket.length >= 2 ? Math.round(mean(inBracket.map((s) => s.flowScore || 0))) : overallFlow;

  // Blend bracket flow with a small streak bonus, clamp to a believable range.
  let probability = Math.round(bracketFlow * 0.8 + 15 + Math.min(streak, 5) * 1.5);
  probability = Math.max(10, Math.min(95, probability));

  const factors = [];
  if (bracketFlow >= overallFlow && inBracket.length >= 2) factors.push(`The ${bracket} is one of your stronger windows`);
  if (streak >= 3) factors.push(`You're on a ${streak}-day streak`);
  if (topFlowActivity) factors.push(`Your top flow trigger is ${topFlowActivity.activity}`);
  if (peakFlowWindow) factors.push(`Peak flow usually hits around ${peakFlowWindow.hour % 12 || 12}${peakFlowWindow.hour < 12 ? 'am' : 'pm'}`);
  if (factors.length === 0) factors.push('Based on your overall session history');

  let rating = 'Mixed';
  if (probability >= 75) rating = 'Excellent';
  else if (probability >= 55) rating = 'Good';
  else if (probability < 35) rating = 'Low';

  return {
    ready: true,
    probability,
    rating,
    bracket,
    bestActivity: topFlowActivity ? topFlowActivity.activity : null,
    factors,
  };
}

/** Flow DNA — an independent 0–100 score per trait; we surface the top blend. */
function buildFlowDNA(sessions) {
  if (sessions.length < 3) return { ready: false, traits: [] };

  const flowOn = (acts) => {
    const sub = sessions.filter((s) => acts.includes(s.activity));
    return sub.length ? Math.round(mean(sub.map((s) => s.flowScore || 0))) : 0;
  };
  const avgFlow = mean(sessions.map((s) => s.flowScore || 0));
  const avgAcc = mean(sessions.map((s) => s.accuracy || 0));
  const avgMin = mean(sessions.map((s) => (s.actualSeconds || 0) / 60));
  const distinctActs = new Set(sessions.map((s) => s.activity)).size;
  const nightShare = sessions.filter((s) => hourBracket(new Date(s.createdAt).getHours()) === 'night').length / sessions.length;
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

  const traits = [
    { key: 'builder', label: 'Builder', score: clamp(flowOn(['coding', 'design', 'admin']) * 0.7 + avgFlow * 0.3) },
    { key: 'creative', label: 'Creative Diver', score: clamp(flowOn(['writing', 'creative', 'design']) * 0.7 + avgFlow * 0.3) },
    { key: 'analyst', label: 'Analyst', score: clamp(avgAcc * 0.6 + flowOn(['studying', 'reading']) * 0.4) },
    { key: 'sprinter', label: 'Sprinter', score: clamp((avgMin <= 20 ? 70 : avgMin <= 35 ? 45 : 20) + avgFlow * 0.3) },
    { key: 'marathoner', label: 'Marathoner', score: clamp((avgMin >= 45 ? 70 : avgMin >= 30 ? 45 : 20) + avgFlow * 0.3) },
    { key: 'explorer', label: 'Explorer', score: clamp((distinctActs / 9) * 100 * 0.7 + avgFlow * 0.3) },
    { key: 'night', label: 'Night Architect', score: clamp(nightShare * 100 * 0.7 + avgFlow * 0.3) },
  ];

  traits.sort((a, b) => b.score - a.score);
  return { ready: true, primary: traits[0], traits: traits.slice(0, 5) };
}

function cap(s) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

module.exports = { buildDiscoveries, buildForecast, buildFlowDNA };
