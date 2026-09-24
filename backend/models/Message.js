const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
