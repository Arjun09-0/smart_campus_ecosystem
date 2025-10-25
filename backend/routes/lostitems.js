const express = require('express');
const router = express.Router();
const LostItem = require('../models/LostItem');
const requireAuth = require('../middleware/authMiddleware');

// Report lost/found (protected)
router.post('/', requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    // normalize: if client sends `found` boolean, convert to status string
    if (typeof payload.found !== 'undefined') {
      payload.status = payload.found ? 'found' : 'lost';
      delete payload.found;
    }
    // set reportedBy from session when available
    if (req.session && req.session.userId) payload.reportedBy = req.session.userId;

    const li = new LostItem(payload);
    await li.save();
    res.json({ ok: true, item: li });
  } catch (err) {
    console.error('Failed to create lost item', err);
    res.status(500).json({ error: err.message });
  }
});

// List
router.get('/', async (req, res) => {
  try {
    const items = await LostItem.find().populate('reportedBy', 'name email');
    res.json({ ok: true, items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark an item as returned (only reporter can mark)
router.patch('/:id/return', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const item = await LostItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    // only reporter can mark as returned
    if (!item.reportedBy || item.reportedBy.toString() !== String(req.session.userId)) {
      return res.status(403).json({ error: 'Not allowed' });
    }
    item.status = 'returned';
    await item.save();
    res.json({ ok: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an item (only reporter can delete)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const item = await LostItem.findById(id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    // debug: log ownership check values
    console.log('[DELETE] session.userId=', req.session && req.session.userId, ' item.reportedBy=', item.reportedBy)
    if (!item.reportedBy || item.reportedBy.toString() !== String(req.session.userId)) {
      console.warn('[DELETE] ownership mismatch - not allowed')
      return res.status(403).json({ error: 'Not allowed' });
    }
    // use deleteOne to avoid issues if `item` is a plain object without document methods
    await LostItem.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
