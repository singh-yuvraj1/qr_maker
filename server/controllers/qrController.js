const QRCode = require('qrcode');
const QR = require('../models/QR');
const { validateUrl } = require('../utils/validateUrl');

/**
 * Generates a QR code as a base64 data URL.
 */
const generateQRDataUrl = async (url, options = {}) => {
  const {
    foregroundColor = '#000000',
    backgroundColor = '#ffffff',
    size = 300,
    errorCorrectionLevel = 'H',
  } = options;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel,
    type: 'image/png',
    width: size,
    margin: 2,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });
};

/**
 * POST /api/qr/generate
 * Generates a QR code. Saves to DB if user is authenticated.
 */
const generateQR = async (req, res) => {
  try {
    const {
      url,
      name,
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      size = 300,
      errorCorrectionLevel = 'H',
    } = req.body;

    // Validate URL
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const normalizedUrl = validation.url;

    // Validate error correction level
    const validECL = ['L', 'M', 'Q', 'H'];
    const ecl = validECL.includes(errorCorrectionLevel) ? errorCorrectionLevel : 'H';

    // Validate size
    const qrSize = Math.min(Math.max(parseInt(size) || 300, 100), 1000);

    // Generate QR data URL
    const qrData = await generateQRDataUrl(normalizedUrl, {
      foregroundColor,
      backgroundColor,
      size: qrSize,
      errorCorrectionLevel: ecl,
    });

    // Save to DB if authenticated
    let savedQR = null;
    if (req.userId) {
      savedQR = await QR.create({
        userId: req.userId,
        name: name ? name.trim().substring(0, 120) : '',
        originalUrl: normalizedUrl,
        qrData,
        foregroundColor,
        backgroundColor,
        size: qrSize,
        errorCorrectionLevel: ecl,
      });
    }

    return res.status(200).json({
      success: true,
      qrData,
      url: normalizedUrl,
      ...(savedQR && { id: savedQR._id }),
    });
  } catch (err) {
    console.error('Generate QR error:', err);
    return res.status(500).json({ error: 'Failed to generate QR code. Please try again.' });
  }
};

/**
 * GET /api/qr
 * Returns all QR codes for the authenticated user.
 */
const getUserQRs = async (req, res) => {
  try {
    const { search, sort = 'newest', page = 1, limit = 20 } = req.query;

    const query = { userId: req.userId };

    // Search by name or URL
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { originalUrl: searchRegex }];
    }

    const sortOrder = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [qrs, total] = await Promise.all([
      QR.find(query)
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      QR.countDocuments(query),
    ]);

    return res.status(200).json({
      qrs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Get QRs error:', err);
    return res.status(500).json({ error: 'Failed to retrieve QR codes.' });
  }
};

/**
 * GET /api/qr/:id
 * Returns a single QR code belonging to the authenticated user.
 */
const getQRById = async (req, res) => {
  try {
    const qr = await QR.findOne({ _id: req.params.id, userId: req.userId });

    if (!qr) {
      return res.status(404).json({ error: 'QR code not found.' });
    }

    return res.status(200).json({ qr });
  } catch (err) {
    console.error('Get QR error:', err);
    return res.status(500).json({ error: 'Failed to retrieve QR code.' });
  }
};

/**
 * DELETE /api/qr/:id
 * Deletes a QR code. Users can only delete their own.
 */
const deleteQR = async (req, res) => {
  try {
    const qr = await QR.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!qr) {
      return res.status(404).json({ error: 'QR code not found.' });
    }

    return res.status(200).json({ message: 'QR code deleted successfully.' });
  } catch (err) {
    console.error('Delete QR error:', err);
    return res.status(500).json({ error: 'Failed to delete QR code.' });
  }
};

/**
 * GET /api/qr/stats
 * Returns dashboard statistics for the authenticated user.
 */
const getUserStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Total QR codes
    const totalQRs = await QR.countDocuments({ userId });

    // Total scans
    const scanResult = await QR.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId.toString()) } },
      { $group: { _id: null, total: { $sum: '$scanCount' } } },
    ]);
    const totalScans = scanResult.length > 0 ? scanResult[0].total : 0;

    // QRs created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthQRs = await QR.countDocuments({
      userId,
      createdAt: { $gte: startOfMonth },
    });

    // Most scanned QR
    const mostScanned = await QR.findOne({ userId })
      .sort({ scanCount: -1 })
      .select('name originalUrl scanCount');

    // Recent QRs (last 5)
    const recentQRs = await QR.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name originalUrl scanCount createdAt qrData');

    // Scans per QR for chart (top 10 by scan count)
    const scansByQR = await QR.find({ userId })
      .sort({ scanCount: -1 })
      .limit(10)
      .select('name originalUrl scanCount createdAt');

    return res.status(200).json({
      totalQRs,
      totalScans,
      thisMonthQRs,
      mostScanned,
      recentQRs,
      scansByQR,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve stats.' });
  }
};

/**
 * POST /api/qr/scan/:id
 * Public route — increments the scan count for a QR code.
 */
const incrementScan = async (req, res) => {
  try {
    const qr = await QR.findByIdAndUpdate(
      req.params.id,
      { $inc: { scanCount: 1 } },
      { new: true }
    );

    if (!qr) {
      return res.status(404).json({ error: 'QR code not found.' });
    }

    // Redirect to the original URL
    return res.redirect(qr.originalUrl);
  } catch (err) {
    console.error('Scan increment error:', err);
    return res.status(500).json({ error: 'Failed to process scan.' });
  }
};

module.exports = {
  generateQR,
  getUserQRs,
  getQRById,
  deleteQR,
  getUserStats,
  incrementScan,
};
