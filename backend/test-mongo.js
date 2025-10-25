// Minimal test script that logs detailed mongoose errors (longer timeout)
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set. Set it in environment or in .env file.');
    process.exitCode = 2;
    return;
  }
  console.log('Testing connection to MongoDB...');
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 20000 });
    console.log('connected-ok');
    await mongoose.disconnect();
    process.exitCode = 0;
  } catch (err) {
    console.error('connect-failed');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

main();
// Simple MongoDB connection test script
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb+srv://Arjun:YOUR_PASSWORD@cluster0.bx9is7t.mongodb.net/smart_campus?retryWrites=true&w=majority';

console.log('Testing connection to MongoDB...');

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 })
  .then(() => { console.log('connected-ok'); process.exit(0) })
  .catch(err => { console.error('connect-failed'); console.error(err); process.exit(1) });
