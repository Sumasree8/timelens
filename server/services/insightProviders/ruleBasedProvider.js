/**
 * Rule-based insight provider (free tier).
 *
 * Deterministic, no external calls, no cost. Every sentence is derived from
 * the user's measured analytics — we never claim an insight the data doesn't
 * support. This is the honest replacement for the old "AI Insight Engine"
 * that only echoed a hardcoded coefficient back at the user.
 */

function topActivity(byActivity, selector) {
  const entries = Object.entries(byActivity).filter(([, v]) => v.count >= 2);
  if (entries.length === 0) return null;
  return entries.sort(selector)[0];
}

function generate({ analytics, user, hourLabels }) {
  const summary = buildSummary(analytics, user, hourLabels);
  const patterns = buildPatterns(analytics, hourLabels);
  const recommendations = buildRecommendations(analytics, user, hourLabels);

  return { summary, patterns, recommendations, source: 'rule-based' };
}

function buildSummary(analytics, user, hourLabels) {
  const { avgAccuracy, avgPerceptionRatio, totalSessions, timeMasteryScore, peakHour } = analytics;

  let summary = `Across ${totalSessions} measured ${totalSessions === 1 ? 'session' : 'sessions'}, your time-perception accuracy is ${avgAccuracy}/100 and your Time Mastery Score is ${timeMasteryScore}/100. `;

  if (avgPerceptionRatio <= 0.85) {
    summary += `On average you underestimate elapsed time (ratio ${avgPerceptionRatio}) — time tends to fly for you, a hallmark of deep engagement. `;
  } else if (avgPerceptionRatio >= 1.15) {
    summary += `On average you overestimate elapsed time (ratio ${avgPerceptionRatio}) — sessions tend to drag, which often signals friction or low engagement. `;
  } else {
    summary += `Your internal clock is well-calibrated (ratio ${avgPerceptionRatio}) — you sense elapsed time accurately. `;
  }

  if (peakHour !== null) {
    summary += `Time most often compresses for you around ${hourLabels[peakHour]}. `;
  }

  if (user && user.streak >= 3) {
    summary += `You're on a ${user.streak}-day streak — consistency is sharpening your time sense.`;
  }

  return summary.trim();
}

function buildPatterns(analytics, hourLabels) {
  const patterns = [];
  const { peakHour, compressionRate, expansionRate, byActivity, byState, consistencyScore, avgAccuracy } = analytics;

  if (peakHour !== null) {
    const bracket = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';
    patterns.push(`Time most often flies in the ${bracket}, around ${hourLabels[peakHour]} — likely your natural deep-work window.`);
  }

  if (compressionRate >= 50) {
    patterns.push(`Time compressed in ${compressionRate}% of sessions — you reach engaged focus frequently.`);
  }
  if (expansionRate >= 30) {
    patterns.push(`Time dragged in ${expansionRate}% of sessions — a meaningful share of your work feels longer than it is.`);
  }

  const flyActivity = topActivity(byActivity, (a, b) => a[1].avgRatio - b[1].avgRatio);
  if (flyActivity && flyActivity[1].avgRatio <= 0.9) {
    patterns.push(`"${flyActivity[0]}" makes time fly the most (ratio ${flyActivity[1].avgRatio}) — your strongest flow trigger.`);
  }
  const dragActivity = topActivity(byActivity, (a, b) => b[1].avgRatio - a[1].avgRatio);
  if (dragActivity && dragActivity[1].avgRatio >= 1.15 && dragActivity[0] !== flyActivity?.[0]) {
    patterns.push(`"${dragActivity[0]}" drags the most (ratio ${dragActivity[1].avgRatio}) — a candidate for batching or restructuring.`);
  }

  const dragState = Object.entries(byState).sort((a, b) => b[1].avgRatio - a[1].avgRatio)[0];
  if (dragState && dragState[1].avgRatio >= 1.15) {
    patterns.push(`When you feel "${dragState[0]}", time consistently expands — emotional state is shaping your perception.`);
  }

  if (consistencyScore > 0.75) {
    patterns.push('Your session rhythm is highly consistent — strong habit formation detected.');
  } else if (consistencyScore < 0.4) {
    patterns.push('Your session frequency is irregular, which makes your time sense harder to calibrate.');
  }

  if (avgAccuracy < 50) {
    patterns.push(`Your estimates are off by a wide margin (accuracy ${avgAccuracy}/100) — your internal clock has room to sharpen.`);
  }

  return patterns;
}

function buildRecommendations(analytics, user, hourLabels) {
  const recs = [];
  const { peakHour, expansionRate, byActivity, consistencyScore, avgAccuracy, timeMasteryScore } = analytics;

  if (peakHour !== null) {
    const endHour = (peakHour + 2) % 24;
    recs.push(`Schedule your hardest work between ${hourLabels[peakHour]}–${hourLabels[endHour]}, when time tends to compress for you.`);
  }

  const dragActivity = topActivity(byActivity, (a, b) => b[1].avgRatio - a[1].avgRatio);
  if (dragActivity && dragActivity[1].avgRatio >= 1.15) {
    recs.push(`"${dragActivity[0]}" feels long — try shorter timeboxed blocks (e.g. 25 min) to keep it from dragging.`);
  }

  if (expansionRate >= 30) {
    recs.push('Add a clear, single goal to each session — ambiguity is a common cause of time dragging.');
  }

  if (avgAccuracy < 60) {
    recs.push('Before each session, guess how long it will feel, then check the result — this calibration loop improves your time sense fastest.');
  }

  if (consistencyScore < 0.5) {
    recs.push('Anchor sessions to a fixed daily time — even 10 minutes a day compounds into a sharper internal clock.');
  }

  if (user && user.streak >= 3) {
    recs.push(`Protect your ${user.streak}-day streak — consistency is the single biggest driver of accurate time perception.`);
  } else {
    recs.push('Run sessions on 3 consecutive days to start a streak and stabilize your baseline.');
  }

  if (timeMasteryScore >= 75) {
    recs.push('You are in the top tier — experiment with longer deep-work blocks to test the limits of your focus.');
  }

  return recs;
}

module.exports = { generate };
