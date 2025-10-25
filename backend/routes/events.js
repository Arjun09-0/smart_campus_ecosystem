const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const requireAuth = require('../middleware/authMiddleware');

// Create event (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    // organizer should come from the session, not the client
    const organizer = req.session && req.session.userId;
    if (!organizer) return res.status(401).json({ error: 'Unauthorized' });
    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const ev = new Event({ title, description, organizer, date: new Date(date), location });
    await ev.save();
    res.json({ ok: true, event: ev });
  } catch (err) {
    console.error('Failed to create event', err);
    res.status(500).json({ error: err.message });
  }
});

// List events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'name email role');
    res.json({ ok: true, events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
