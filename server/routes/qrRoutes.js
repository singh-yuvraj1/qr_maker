const express = require('express');
const router = express.Router();
const { generateQR } = require('../controllers/qrController');

// POST /api/qr/generate — validate URL and generate QR code
router.post('/generate', generateQR);

module.exports = router;
