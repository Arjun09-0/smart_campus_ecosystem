// Quick connectivity checker for MongoDB. Reads MONGO_URI from environment.
require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI not set in environment. Set MONGO_URI or add it to .env');
    process.exitCode = 2;
    return;
  }

  console.log('Testing MongoDB connection to:', uri.replace(/:(?:[^:@]+)@/, ':*****@'));
  try {
    // short connect timeout so this returns quickly if DNS fails
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 8000 });
    console.log('connected-ok');
    await mongoose.disconnect();
    process.exitCode = 0;
  } catch (err) {
    console.error('connect-failed');
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

run();
// Tiny connection checker for MongoDB Atlas
// Usage: node check-mongo.js
const mongoose = require('mongoose')

const uri = process.env.MONGO_URI
if (!uri) {
  console.error('MONGO_URI not set in environment. Set it and re-run: $env:MONGO_URI="<uri>"; node check-mongo.js')
  process.exit(2)
}

async function run() {
  console.log('Attempting to connect to MongoDB with masked URI...')
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 })
    console.log('Connected to MongoDB — success!')
    await mongoose.connection.close()
    process.exit(0)
  } catch (err) {
    console.error('Failed to connect to MongoDB:')
    console.error(err && err.message ? err.message : err)
    // print some useful nested info if available
    if (err && err.reason) console.error('Reason:', err.reason)
    process.exit(1)
  }
}

run()
