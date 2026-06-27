/**
 * TimeLens Perception utilities (client).
 *
 * Mirrors the server's measurement logic. The product MEASURES time
 * perception via the verbal time-estimation paradigm: the user works with the
 * clock hidden, then blindly estimates how long it felt. We compare that
 * estimate to the real elapsed time. Nothing here is fabricated from a
 * coefficient — every value comes from the user's own estimate.
 */

// Activities a session can be labelled with. Self-reported context, not a multiplier.
export const ACTIVITY_CONFIG = {
  coding:   { label: 'Coding',   emoji: '💻', color: '#3B82F6' },
  writing:  { label: 'Writing',  emoji: '✍️', color: '#8B5CF6' },
  reading:  { label: 'Reading',  emoji: '📖', color: '#06B6D4' },
  studying: { label: 'Studying', emoji: '📚', color: '#818CF8' },
  meeting:  { label: 'Meeting',  emoji: '🗣️', color: '#F59E0B' },
  design:   { label: 'Design',   emoji: '🎨', color: '#A78BFA' },
  admin:    { label: 'Admin',    emoji: '🗂️', color: '#64748B' },
  creative: { label: 'Creative', emoji: '✨', color: '#22D3EE' },
  other:    { label: 'Other',    emoji: '⚪', color: '#64748B' },
};

// Optional self-reported state/mood during the session.
export const STATE_CONFIG = {
  focused:    { label: 'Focused',    emoji: '🎯' },
  energized:  { label: 'Energized',  emoji: '⚡' },
  neutral:    { label: 'Neutral',    emoji: '😐' },
  tired:      { label: 'Tired',      emoji: '😴' },
  anxious:    { label: 'Anxious',    emoji: '😰' },
  distracted: { label: 'Distracted', emoji: '🌀' },
};

// Experiment context — the variables correlated against flow.
export const ENVIRONMENT_CONFIG = {
  home:     { label: 'Home',     emoji: '🏠' },
  office:   { label: 'Office',   emoji: '🏢' },
  cafe:     { label: 'Café',     emoji: '☕' },
  library:  { label: 'Library',  emoji: '📚' },
  outdoors: { label: 'Outdoors', emoji: '🌳' },
  other:    { label: 'Other',    emoji: '📍' },
};

export const MUSIC_CONFIG = {
  silence:   { label: 'Silence',   emoji: '🤫' },
  lofi:      { label: 'Lo-fi',     emoji: '🎧' },
  ambient:   { label: 'Ambient',   emoji: '🌌' },
  classical: { label: 'Classical', emoji: '🎻' },
  energetic: { label: 'Energetic', emoji: '🔊' },
  other:     { label: 'Other',     emoji: '🎵' },
};

export const ENERGY_CONFIG = {
  low:    { label: 'Low',    emoji: '🪫' },
  medium: { label: 'Medium', emoji: '🔋' },
  high:   { label: 'High',   emoji: '⚡' },
};

// The four phases of a focus session, shown on the result reveal.
export const FLOW_PHASES = [
  { key: 'settling', label: 'Settling', emoji: '🌱' },
  { key: 'focus', label: 'Concentration', emoji: '🎯' },
  { key: 'flow', label: 'Flow', emoji: '🌊' },
  { key: 'recovery', label: 'Recovery', emoji: '🍃' },
];

export const COMPRESSED_MAX = 0.8;
export const EXPANDED_MIN = 1.2;

// Visual identity per direction of distortion.
export const DIRECTION_CONFIG = {
  compressed: {
    label: 'Time flew',
    description: 'You underestimated — a sign of deep engagement / flow.',
    color: '#06B6D4',
    emoji: '🌊',
  },
  calibrated: {
    label: 'Well calibrated',
    description: 'Your estimate was close to reality — accurate time sense.',
    color: '#3B82F6',
    emoji: '🎯',
  },
  expanded: {
    label: 'Time dragged',
    description: 'You overestimated — often a sign of friction or boredom.',
    color: '#F59E0B',
    emoji: '🐌',
  },
};

/**
 * Compute perception metrics from real elapsed seconds and the user's blind
 * estimate. Returns { ratio, accuracy (0-100), direction }.
 */
export const computePerception = (actualSeconds, estimatedSeconds) => {
  const actual = Math.max(0, Number(actualSeconds) || 0);
  const estimated = Math.max(0, Number(estimatedSeconds) || 0);

  if (actual === 0) {
    return { ratio: 1, accuracy: 0, direction: 'calibrated' };
  }

  const ratio = estimated / actual;
  const accuracy = Math.max(0, Math.min(100, 100 * (1 - Math.abs(estimated - actual) / actual)));

  let direction = 'calibrated';
  if (ratio <= COMPRESSED_MAX) direction = 'compressed';
  else if (ratio >= EXPANDED_MIN) direction = 'expanded';

  return {
    ratio: parseFloat(ratio.toFixed(2)),
    accuracy: parseFloat(accuracy.toFixed(1)),
    direction,
    flowScore: computeFlowScore(ratio),
  };
};

/** Objective flow signal (0–100) from time compression. Mirrors the server. */
export const computeFlowScore = (ratio) =>
  Math.round(Math.max(0, Math.min(100, (1 - ratio) * 250)));

/** Colour ramp for a flow score (blue → cyan = discovery/flow). */
export const flowColor = (score) => {
  if (score >= 80) return '#22D3EE';
  if (score >= 60) return '#06B6D4';
  if (score >= 40) return '#3B82F6';
  if (score >= 20) return '#6366F1';
  if (score > 0) return '#334155';
  return '#1b2436';
};

/** Format seconds as MM:SS. */
export const formatTime = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/** Format seconds as a human-readable duration. */
export const formatDuration = (totalSeconds) => {
  if (totalSeconds < 60) return `${Math.round(totalSeconds)}s`;
  if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)}m ${Math.round(totalSeconds % 60)}s`;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${h}h ${m}m`;
};

/** Simple debounce utility. */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
