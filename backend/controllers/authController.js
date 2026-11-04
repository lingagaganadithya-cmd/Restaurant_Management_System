const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: 'user',
    });

    return res.status(201).json({
      message: 'User registered successfully.',
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password.' });
    }

    return res.json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

const getProfile = async (req, res) => {
  return res.json(req.user);
};

module.exports = { registerUser, loginUser, getProfile };
