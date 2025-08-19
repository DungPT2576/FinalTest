require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const users = [
      { fullName: 'Admin User', email: 'admin@example.com', phoneNumber: '0123456789', password: 'Admin@123', role: 'ADMIN' },
      { fullName: 'Test Customer', email: 'customer1@example.com', phoneNumber: '0987654321', password: 'Customer@123', role: 'CUSTOMER' }
    ];

    for (const u of users) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 10);
        await User.create({ ...u, password: hash });
        console.log(`Created user ${u.email}`);
      } else {
        console.log(`User ${u.email} already exists, skipping.`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
