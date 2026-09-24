const mongoose = require('mongoose');

const InterestRequestSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

InterestRequestSchema.index({ tenant: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('InterestRequest', InterestRequestSchema);
