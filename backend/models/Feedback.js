const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['Academic', 'Infrastructure', 'Club', 'Other'], default: 'Other' },
  message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved'], default: 'open' },
  response: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
