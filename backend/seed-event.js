// Seed script to create a sample event and organizer user
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

async function run() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_campus';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');

  // Create organizer user if not exists
  const email = 'aids-dept@smartcampus.local';
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name: 'AI&DS Dept', email, role: 'faculty' });
    await user.save();
    console.log('Created organizer user:', user._id.toString());
  } else {
    console.log('Found existing organizer user:', user._id.toString());
  }

  // Create event if not exists
  const title = 'vibe-ai--thon';
  let ev = await Event.findOne({ title });
  if (!ev) {
    ev = new Event({
      title,
      description: 'audit this is conducted by ai&ds dept',
      organizer: user._id,
      date: new Date('2025-10-25T10:00:00Z'),
      location: 'Main Auditorium (Venue)'
    });
    await ev.save();
    console.log('Created event:', ev._id.toString());
  } else {
    console.log('Event already exists:', ev._id.toString());
  }

  await mongoose.connection.close();
  console.log('Seeding complete, connection closed');
}

run().catch(err => {
  console.error('Seeding failed', err);
  process.exit(1);
});
