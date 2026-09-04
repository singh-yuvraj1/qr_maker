const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generates a signed JWT containing the user's ID.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * POST /api/auth/register
 * Registers a new user.
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ─── Input validation ────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // ─── Check for existing user ─────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // ─── Create user (password hashed by pre-save hook) ──────────────────
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Must explicitly select password since it's `select: false` in schema
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

/**
 * GET /api/auth/me
 * Returns the current authenticated user's profile.
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.status(200).json({ user: user.toSafeObject() });
  } catch (err) {
    console.error('GetMe error:', err);
    return res.status(500).json({ error: 'Failed to retrieve user profile.' });
  }
};

module.exports = { register, login, getMe };
