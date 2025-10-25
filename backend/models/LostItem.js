const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  contact: { type: String },
  imageUrl: { type: String },
  location: { type: String },
  status: { type: String, enum: ['lost', 'found', 'returned'], default: 'lost' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostItem', lostItemSchema);
