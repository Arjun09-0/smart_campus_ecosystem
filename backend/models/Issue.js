const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  type: { type: String, enum: ['feedback'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  contact: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  response: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Issue', issueSchema);
