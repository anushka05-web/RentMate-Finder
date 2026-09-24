const mongoose = require('mongoose');

const CompatibilitySchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  explanation: {
    type: String,
    required: true,
  },
  calculatedBy: {
    type: String,
    enum: ['AI', 'Rule-Based'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to guarantee one compatibility record per tenant-listing pair
CompatibilitySchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Compatibility', CompatibilitySchema);
