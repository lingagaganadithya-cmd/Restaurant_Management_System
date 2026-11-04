require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/restaurant_management_system';
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });

    const email = process.env.ADMIN_EMAIL || 'admin@flavornest.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log('Admin account already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name: 'Restaurant Admin',
      email: email.toLowerCase(),
      phone: '9999999999',
      password: hashedPassword,
      role: 'admin',
    });

    console.log(`Admin account created successfully. Email: ${email} Password: ${password}`);
  } catch (error) {
    console.error('Failed to create admin account:', error.message);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();
