const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/authMiddleware');

// Protect all admin routes: must be authenticated and have admin role
router.use(requireAuth);
router.use(requireRole('admin'));

// Promote or change a user's role
// POST /api/admin/users/:id/role  { role: 'faculty' }
router.post('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role || !['student','faculty','admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    return res.json({ ok: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Admin change role error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// List users (simple paged list)
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(0, parseInt(req.query.page || '0'));
    const limit = Math.min(100, parseInt(req.query.limit || '50'));
    const users = await User.find().select('name email role createdAt').skip(page * limit).limit(limit).lean();
    return res.json({ ok: true, users });
  } catch (err) {
    console.error('Admin list users error', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
