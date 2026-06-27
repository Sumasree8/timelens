const mongoose = require('mongoose');

/**
 * A Flow Experiment — a structured A/B test the user runs on themselves
 * (e.g. "Lo-fi vs Silence, 5 sessions each"). Results are computed from the
 * real sessions logged after the challenge started.
 */
const challengeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dimension: {
    type: String,
    enum: ['activity', 'environment', 'music', 'energy', 'stateTag', 'timeOfDay'],
    required: true,
  },
  valueA: { type: String, required: true },
  valueB: { type: String, required: true },
  targetPer: { type: Number, default: 5, min: 2, max: 20 },
  status: { type: String, enum: ['active', 'complete', 'abandoned'], default: 'active' },
}, { timestamps: true });

challengeSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);
