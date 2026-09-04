const express = require('express');
const router = express.Router();
const {
  generateQR,
  getUserQRs,
  getQRById,
  deleteQR,
  getUserStats,
  incrementScan,
} = require('../controllers/qrController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// POST /api/qr/generate — public but saves to DB if authenticated
router.post('/generate', optionalAuth, generateQR);

// GET /api/qr/stats — protected
router.get('/stats', protect, getUserStats);

// GET /api/qr/scan/:id — public, increments scan count + redirects
router.get('/scan/:id', incrementScan);

// GET /api/qr — protected, list all user QRs
router.get('/', protect, getUserQRs);

// GET /api/qr/:id — protected, get single QR
router.get('/:id', protect, getQRById);

// DELETE /api/qr/:id — protected
router.delete('/:id', protect, deleteQR);

module.exports = router;
