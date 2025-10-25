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
    const testEmail = 'n.arjunreddy893297@gmail.com' // Temporary: allow test account
    
    if (!email || (!email.toLowerCase().endsWith(`@${allowedDomain}`) && email.toLowerCase() !== testEmail.toLowerCase())) {
      console.warn('Blocked sign-in attempt:', { email, allowedDomain, testEmail })
      return res.status(403).json({ ok: false, error: `Only @${allowedDomain} accounts are permitted. If you need help, contact campus IT.` })
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
