const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const requireAuth = require('../middleware/authMiddleware');

// Create an issue (feedback). Anonymous allowed; if logged in, attach reportedBy
router.post('/', async (req, res) => {
  try {
    const { type, title, message, contact } = req.body;
    if (!type || !title || !message) return res.status(400).json({ error: 'Missing fields' });
    const payload = { type, title, message, contact };
    if (req.session && req.session.userId) payload.reportedBy = req.session.userId;
    const it = new Issue(payload);
    await it.save();
    res.json({ ok: true, item: it });
  } catch (err) {
    console.error('Failed to create issue', err);
    res.status(500).json({ error: err.message });
  }
});

// List issues (public). Allow query by type
router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    const items = await Issue.find(q).populate('reportedBy', 'name email').sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: update issue (response, status)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    // only admin may update issues
    if (!req.session || req.session.userRole !== 'admin') return res.status(403).json({ error: 'Not allowed' });
    const id = req.params.id;
    const updates = {};
    if (typeof req.body.status !== 'undefined') updates.status = req.body.status;
    if (typeof req.body.response !== 'undefined') updates.response = req.body.response;
    const item = await Issue.findByIdAndUpdate(id, updates, { new: true }).populate('reportedBy', 'name email');
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
