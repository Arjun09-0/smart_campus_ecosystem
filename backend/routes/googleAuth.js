const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'Missing idToken' });
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email;
    console.log('Google auth payload:', { email: payload.email, name: payload.name, sub: payload.sub });

    // Restrict sign-in to KLH accounts only
    const allowedDomain = 'klh.edu.in'
    if (!email || !email.toLowerCase().endsWith(`@${allowedDomain}`)) {
      console.warn('Blocked sign-in for non-KLH email:', email)
      return res.status(403).json({ ok: false, error: `Only kl university accounts are allowed to sign in.` })
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name: payload.name || payload.email, email, role: 'student' });
      await user.save();
    }
    // create session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    console.log('Session created for userId:', user._id.toString());
    res.json({ ok: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Google auth error', err);
    res.status(401).json({ error: 'Invalid ID token' });
  }
});

module.exports = router;
