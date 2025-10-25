const express = require('express');
const router = express.Router();
const Club = require('../models/Club');
const requireAuth = require('../middleware/authMiddleware');

// List clubs
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find().populate('owner', 'name email').lean();
    res.json({ ok: true, clubs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a club (authenticated users)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, contact } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const payload = { name, description, contact, owner: req.session.userId };
    const club = new Club(payload);
    // add owner as member
    club.members = [req.session.userId];
    await club.save();
    res.json({ ok: true, club });
  } catch (err) {
    console.error('Failed to create club', err);
    res.status(500).json({ error: err.message });
  }
});

// Get club by id
router.get('/:id', async (req, res) => {
  try {
    const club = await Club.findById(req.params.id).populate('owner', 'name email').populate('members', 'name email');
    if (!club) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true, club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join club
router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ error: 'Not found' });
    const uid = String(req.session.userId);
    if (!club.members.map(m => String(m)).includes(uid)) {
      club.members.push(req.session.userId);
      await club.save();
    }
    res.json({ ok: true, club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Leave club
router.post('/:id/leave', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ error: 'Not found' });
    const uid = String(req.session.userId);
    club.members = club.members.filter(m => String(m) !== uid);
    await club.save();
    res.json({ ok: true, club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update club (owner or admin)
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ error: 'Not found' });
    const uid = String(req.session.userId);
    const isOwner = club.owner && String(club.owner) === uid;
    const isAdmin = req.session.userRole === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not allowed' });
    const { name, description, contact } = req.body;
    if (name) club.name = name;
    if (description) club.description = description;
    if (contact) club.contact = contact;
    await club.save();
    res.json({ ok: true, club });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete club (owner or admin)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const club = await Club.findById(id);
    if (!club) return res.status(404).json({ error: 'Not found' });
    const uid = String(req.session.userId);
    const isOwner = club.owner && String(club.owner) === uid;
    const isAdmin = req.session.userRole === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not allowed' });
    await Club.deleteOne({ _id: id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
