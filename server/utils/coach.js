/**
 * Coaching layer — streaks, a weekly story, and conditions-based coaching.
 * Pure functions (no DB, time passed in) so they're unit-testable.
 *
 * The coach does NOT just summarise numbers. It reasons about the CONDITIONS
 * of the user's best sessions ("you'd slept 8h, low noise, morning — recreate
 * that"), framed as observations from their own data.
 */

const DAY_MS = 86400000;
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const hourBracket = (h) => (h >= 5 && h < 12 ? 'morning' : h >= 12 && h < 17 ? 'afternoon' : h >= 17 && h < 22 ? 'evening' : 'night');
const sleepBucket = (h) => (h == null ? null : h < 6 ? 'under 6h' : h < 7.5 ? '6–7.5h' : '7.5h+');
const dayKey = (d) => new Date(d).toISOString().split('T')[0];
const mode = (arr) => {
  const c = {};
  arr.filter((v) => v != null).forEach((v) => { c[v] = (c[v] || 0) + 1; });
  const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
  return e ? e[0] : null;
};

/** Streak + lifetime highlights. */
function buildStreaks(sessions, now) {
  if (sessions.length === 0) {
    return { current: 0, longest: 0, bestFlow: 0, longestCompression: 0, deepWorkHours: 0, experiments: 0 };
  }
  const days = [...new Set(sessions.map((s) => dayKey(s.createdAt)))].sort();

  // Longest run of consecutive calendar days.
  let longest = 1; let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = (new Date(days[i]) - new Date(days[i - 1])) / DAY_MS;
    run = gap === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  // Current streak counts back from today (or yesterday) while days are consecutive.
  const today = dayKey(now);
  const yesterday = dayKey(new Date(new Date(now) - DAY_MS));
  let current = 0;
  if (days.includes(today) || days.includes(yesterday)) {
    current = 1;
    let cursor = days.includes(today) ? today : yesterday;
    for (let i = days.length - 2; i >= 0; i--) {
      const gap = (new Date(cursor) - new Date(days[i])) / DAY_MS;
      if (gap === 1) { current++; cursor = days[i]; } else break;
    }
  }

  return {
    current,
    longest,
    bestFlow: Math.max(...sessions.map((s) => s.flowScore || 0)),
    longestCompression: Math.round(Math.max(...sessions.map((s) => (1 - (s.perceptionRatio || 1)) * 100), 0)),
    deepWorkHours: parseFloat((sessions.reduce((a, s) => a + (s.actualSeconds || 0), 0) / 3600).toFixed(1)),
    experiments: sessions.length,
  };
}

/** Narrative recap of the last 7 days. */
function buildWeeklyStory(sessions, now) {
  const cutoff = new Date(now) - 7 * DAY_MS;
  const week = sessions.filter((s) => new Date(s.createdAt) >= cutoff);
  if (week.length < 2) {
    return { ready: false, reason: 'Run a few sessions this week to get your story.' };
  }

  const flowCount = week.filter((s) => s.direction === 'compressed').length;

  // Best day by average flow.
  const byDay = {};
  week.forEach((s) => {
    const k = new Date(s.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    byDay[k] = byDay[k] || [];
    byDay[k].push(s.flowScore || 0);
  });
  const bestDay = Object.entries(byDay).sort((a, b) => mean(b[1]) - mean(a[1]))[0];

  // Most compressing vs most dragging activity this week.
  const byAct = {};
  week.forEach((s) => { (byAct[s.activity] = byAct[s.activity] || []).push(s.perceptionRatio || 1); });
  const actRatios = Object.entries(byAct).map(([a, r]) => ({ a, ratio: mean(r) }));
  const flew = [...actRatios].sort((x, y) => x.ratio - y.ratio)[0];
  const dragged = [...actRatios].sort((x, y) => y.ratio - x.ratio)[0];

  const lines = [];
  lines.push(`You ran ${week.length} experiments and reached flow ${flowCount} ${flowCount === 1 ? 'time' : 'times'}.`);
  if (bestDay) lines.push(`Your sharpest day was ${bestDay[0]} — flow averaged ${Math.round(mean(bestDay[1]))}/100.`);
  if (flew && flew.ratio < 0.95) lines.push(`${cap(flew.a)} compressed time the most (felt ${Math.round((1 - flew.ratio) * 100)}% shorter).`);
  if (dragged && dragged.ratio > 1.1 && dragged.a !== flew?.a) lines.push(`${cap(dragged.a)} dragged — it felt ${Math.round((dragged.ratio - 1) * 100)}% longer than real.`);

  let recommendation = 'Keep logging conditions — the more you log, the sharper your map gets.';
  if (dragged && dragged.ratio > 1.1) recommendation = `Try moving ${dragged.a} to a different time or shortening it into 25-minute blocks.`;
  else if (flew) recommendation = `Protect time for ${flew.a} — it's where you flow most.`;

  return { ready: true, lines, recommendation };
}

/**
 * Conditions-based coaching. Compares the user's best sessions (top flow) to
 * the rest and tells them which conditions to recreate.
 */
function buildCoach(sessions) {
  if (sessions.length < 5) {
    return { ready: false, reason: `Run ${5 - sessions.length} more experiments to unlock your coach.` };
  }

  const sorted = [...sessions].sort((a, b) => (b.flowScore || 0) - (a.flowScore || 0));
  const topN = Math.max(2, Math.round(sorted.length * 0.25));
  const top = sorted.slice(0, topN);
  const topAvg = Math.round(mean(top.map((s) => s.flowScore || 0)));

  const cards = [];

  // 1. Recreate-your-best-conditions card.
  const cond = {
    activity: mode(top.map((s) => s.activity)),
    time: mode(top.map((s) => hourBracket(new Date(s.createdAt).getHours()))),
    music: mode(top.map((s) => s.music)),
    environment: mode(top.map((s) => s.environment)),
    energy: mode(top.map((s) => s.energy)),
    sleep: mode(top.map((s) => sleepBucket(s.sleepHours))),
  };
  const parts = [];
  if (cond.time) parts.push(`in the ${cond.time}`);
  if (cond.activity) parts.push(`on ${cond.activity}`);
  if (cond.music) parts.push(`with ${cond.music}`);
  if (cond.environment) parts.push(`at ${cond.environment === 'cafe' ? 'a café' : cond.environment}`);
  if (cond.energy) parts.push(`on ${cond.energy} energy`);
  if (cond.sleep) parts.push(`after ${cond.sleep} sleep`);

  if (parts.length) {
    cards.push({
      icon: '🎯',
      iconKey: 'target',
      title: 'Your flow isn’t accidental',
      body: `Your best sessions (flow ${topAvg}/100) happened ${parts.slice(0, 4).join(', ')}. Recreate those conditions and you'll likely drop into flow faster.`,
    });
  }

  // 2. A condition that clearly separates good from bad.
  const rest = sorted.slice(topN);
  const diff = strongestDiff(top, rest);
  if (diff) cards.push(diff);

  // 3. Surface a reflection from a top session, if logged.
  const topReflection = top.find((s) => s.reflection && s.reflection.trim());
  if (topReflection) {
    cards.push({
      icon: '📝',
      iconKey: 'note',
      title: 'Your own words, from a high-flow session',
      body: `“${topReflection.reflection.trim()}” — worth repeating.`,
    });
  }

  // 4. Gentle nudge if accuracy is low (time blindness).
  const avgAcc = mean(sessions.map((s) => s.accuracy || 0));
  if (avgAcc < 55) {
    cards.push({
      icon: '🧭',
      iconKey: 'compass',
      title: 'Sharpen your time sense',
      body: `Your estimates are off by a fair margin (accuracy ${Math.round(avgAcc)}/100). Try the Trainer for a few minutes — guessing intervals deliberately is the fastest way to calibrate.`,
    });
  }

  return { ready: cards.length > 0, topFlow: topAvg, cards };
}

/** Find the single condition whose presence most separates top from bottom flow. */
function strongestDiff(top, rest) {
  const dims = [
    { key: 'music', getValue: (s) => s.music, fmt: (v) => v },
    { key: 'environment', getValue: (s) => s.environment, fmt: (v) => (v === 'cafe' ? 'a café' : v) },
    { key: 'sleep', getValue: (s) => sleepBucket(s.sleepHours), fmt: (v) => `${v} sleep` },
    { key: 'time', getValue: (s) => hourBracket(new Date(s.createdAt).getHours()), fmt: (v) => `the ${v}` },
  ];
  let best = null;
  dims.forEach((d) => {
    const topMode = mode(top.map(d.getValue));
    if (!topMode) return;
    const topShare = top.filter((s) => String(d.getValue(s)) === topMode).length / top.length;
    const restShare = rest.length ? rest.filter((s) => String(d.getValue(s)) === topMode).length / rest.length : 0;
    const gap = topShare - restShare;
    if (gap >= 0.35 && (!best || gap > best.gap)) {
      best = { gap, icon: '🔬', iconKey: 'pattern', title: 'A pattern worth testing', body: `${cap(d.fmt(topMode))} shows up in most of your best sessions but rarely your weaker ones. Try it deliberately and see if it holds.` };
    }
  });
  return best;
}

function cap(s) { return String(s).charAt(0).toUpperCase() + String(s).slice(1); }

module.exports = { buildStreaks, buildWeeklyStory, buildCoach };
