#!/usr/bin/env node
// One-time script to promote a user to admin by email.
// Usage: NODE_ENV=development MONGO_URI='...' node scripts/make-admin.js user@example.com

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('Usage: node scripts/make-admin.js user@example.com');
    process.exit(2);
  }
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Please set MONGO_URI environment variable');
    process.exit(2);
  }
  try {
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found:', email);
      process.exit(3);
    }
    user.role = 'admin';
    await user.save();
    console.log('Promoted to admin:', user.email, user._id.toString());
    process.exit(0);
  } catch (err) {
    console.error('Error making admin:', err);
    process.exit(1);
  }
}

main();
