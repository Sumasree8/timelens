const mongoose = require('mongoose');
const { ACTIVITIES, STATE_TAGS, ENVIRONMENTS, MUSIC, ENERGY } = require('../utils/perception');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // What the user was actually doing (self-reported label, not a coefficient).
  activity: {
    type: String,
    enum: ACTIVITIES,
    required: true,
  },
  // Optional self-reported state/mood during the session.
  stateTag: {
    type: String,
    enum: [...STATE_TAGS, null],
    default: null,
  },
  // ── Experiment context — the variables we correlate against flow ──
  environment: { type: String, enum: [...ENVIRONMENTS, null], default: null },
  music: { type: String, enum: [...MUSIC, null], default: null },
  energy: { type: String, enum: [...ENERGY, null], default: null },
  sleepHours: { type: Number, default: null, min: 0, max: 24 },
  // "Expected" — how long the user planned to focus (minutes).
  plannedMinutes: { type: Number, default: null, min: 0 },
  // Real elapsed time measured by the stopwatch (seconds). Source of truth.
  actualSeconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  // The user's blind estimate of how long it felt (seconds).
  estimatedSeconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  // Measured perception ratio: estimatedSeconds / actualSeconds.
  perceptionRatio: {
    type: Number,
    default: 1,
    min: 0,
  },
  // Chronoception accuracy 0–100 (how close the estimate was to reality).
  accuracy: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  // compressed (time flew) | calibrated | expanded (time dragged).
  direction: {
    type: String,
    enum: ['compressed', 'calibrated', 'expanded'],
    default: 'calibrated',
  },
  // Objective flow signal 0–100, derived from time compression.
  flowScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  // Optional one-line daily reflection ("what helped / what interrupted you?").
  reflection: {
    type: String,
    default: null,
    maxlength: 280,
  },
}, { timestamps: true });

// Compound indexes for analytics queries.
sessionSchema.index({ userId: 1, createdAt: -1 });
sessionSchema.index({ userId: 1, activity: 1 });

module.exports = mongoose.model('Session', sessionSchema);
