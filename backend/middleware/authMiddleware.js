const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (e) {
    console.error('requireAuth error', e);
    return res.status(500).json({ error: 'Server error' });
  }
}

// roles can be a string or array of allowed roles
function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return async function (req, res, next) {
    try {
      // Prefer role stored in session (set at login). If missing, fetch user.
      let role = req.session && req.session.userRole;
      if (!role && req.session && req.session.userId) {
        const user = await User.findById(req.session.userId).select('role');
        role = user ? user.role : null;
      }
      if (!role) return res.status(401).json({ error: 'Unauthorized' });
      if (!allowed.includes(role)) return res.status(403).json({ error: 'Forbidden: insufficient role' });
      return next();
    } catch (e) {
      console.error('requireRole error', e);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = requireAuth;
module.exports.requireRole = requireRole;
