const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register (basic, no validation)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, studentId } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, role, studentId, passwordHash: hash });
    await user.save();
    res.json({ ok: true, userId: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (stub: checks password and returns simple JSON; replace with JWT later)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid creds' });
    const match = await bcrypt.compare(password, user.passwordHash || '');
    if (!match) return res.status(400).json({ error: 'Invalid creds' });
    // set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    res.json({ ok: true, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) return res.json({ ok: true, user: null });
    const user = await User.findById(req.session.userId).select('-passwordHash');
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

module.exports = router;
