const mongoose = require('mongoose');

/**
 * One round of the Internal Clock Trainer — a time-production task.
 * The user tries to let exactly `targetSeconds` pass with no clock, then stops.
 * We record how close they got. Tracking these over time shows whether the
 * user's internal clock is genuinely getting sharper.
 */
const trainerRoundSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  targetSeconds: { type: Number, required: true, min: 1 },
  actualSeconds: { type: Number, required: true, min: 0 },
  accuracy: { type: Number, default: 0, min: 0, max: 100 }, // 0–100, closeness to target
}, { timestamps: true });

trainerRoundSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('TrainerRound', trainerRoundSchema);
