const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  summary: {
    type: String,
    required: true,
  },
  patterns: [{
    type: String,
  }],
  recommendations: [{
    type: String,
  }],
  // How this report was generated. Honest provenance for the user.
  source: {
    type: String,
    enum: ['rule-based', 'llm'],
    default: 'rule-based',
  },
  analyticsSnapshot: {
    avgAccuracy: Number,
    avgPerceptionRatio: Number,
    compressionRate: Number,
    consistencyScore: Number,
    peakHour: Number,
    timeMasteryScore: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('Insight', insightSchema);
