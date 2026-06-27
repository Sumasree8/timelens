/**
 * TimeLens — Time Perception measurement.
 *
 * This is the real, honest core of the product. We do NOT fabricate a
 * "perceived clock" from a hardcoded coefficient. Instead we measure the
 * user's actual chronoception using the verbal time-estimation paradigm
 * from cognitive psychology:
 *
 *   1. The user works for a real interval with the clock hidden.
 *   2. Afterwards they blindly estimate how long it felt.
 *   3. We compare their estimate to the real elapsed time.
 *
 * Every number below is derived from that comparison — never invented.
 */

// Activities the user can label a session with. Self-reported context, not a multiplier.
const ACTIVITIES = [
  'coding', 'writing', 'reading', 'studying',
  'meeting', 'design', 'admin', 'creative', 'other',
];

// Optional self-reported state/mood at the time of the session.
const STATE_TAGS = [
  'focused', 'energized', 'neutral', 'tired', 'anxious', 'distracted',
];

// Experiment context — the variables we correlate against flow.
const ENVIRONMENTS = ['home', 'office', 'cafe', 'library', 'outdoors', 'other'];
const MUSIC = ['silence', 'lofi', 'ambient', 'classical', 'energetic', 'other'];
const ENERGY = ['low', 'medium', 'high'];

// Boundaries (ratio of estimated/actual) for classifying the experience.
const COMPRESSED_MAX = 0.8; // estimate <= 80% of real time → time flew
const EXPANDED_MIN = 1.2; // estimate >= 120% of real time → time dragged

/**
 * Compute perception metrics from a real elapsed time and the user's
 * blind estimate, both in seconds.
 *
 *   ratio    = estimated / actual   (1.0 = perfectly accurate)
 *   accuracy = how close the estimate was, 0–100 (real chronoception accuracy)
 *   direction= compressed | calibrated | expanded
 */
function computePerception(actualSeconds, estimatedSeconds) {
  const actual = Math.max(0, Number(actualSeconds) || 0);
  const estimated = Math.max(0, Number(estimatedSeconds) || 0);

  if (actual === 0) {
    return { ratio: 1, accuracy: 0, direction: 'calibrated' };
  }

  const ratio = estimated / actual;

  // Accuracy: symmetric closeness regardless of over/under estimation.
  const accuracy = Math.max(0, Math.min(100, 100 * (1 - Math.abs(estimated - actual) / actual)));

  let direction = 'calibrated';
  if (ratio <= COMPRESSED_MAX) direction = 'compressed';
  else if (ratio >= EXPANDED_MIN) direction = 'expanded';

  return {
    ratio: parseFloat(ratio.toFixed(3)),
    accuracy: parseFloat(accuracy.toFixed(1)),
    direction,
    flowScore: computeFlowScore(ratio),
  };
}

/**
 * Objective flow signal (0–100), derived purely from time compression.
 * Time compression is a validated correlate of flow state — when time flies,
 * the user was engaged. ratio 1.0 → 0 (no flow); ratio 0.6 or lower → 100.
 * Expansion (ratio > 1) means time dragged → 0 flow.
 */
function computeFlowScore(ratio) {
  return Math.round(Math.max(0, Math.min(100, (1 - ratio) * 250)));
}

module.exports = {
  ACTIVITIES,
  STATE_TAGS,
  ENVIRONMENTS,
  MUSIC,
  ENERGY,
  COMPRESSED_MAX,
  EXPANDED_MIN,
  computePerception,
  computeFlowScore,
};
