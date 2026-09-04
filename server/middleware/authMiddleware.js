const jwt = require('jsonwebtoken');

/**
 * Auth Middleware
 * Reads the Authorization Bearer token, verifies it, and attaches userId to req.
 * Rejects requests with invalid, missing, or expired tokens.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authorized. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Authentication failed.' });
  }
};

/**
 * Optional Auth Middleware
 * Attaches userId if a valid token is present, but does NOT block the request if missing.
 * Used for routes that work for both guests and authenticated users (e.g., QR generation).
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
    } catch {
      // Invalid token — continue as guest, don't block
      req.userId = null;
    }
  } else {
    req.userId = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
