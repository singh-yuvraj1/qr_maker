const QRCode = require('qrcode');
const { validateUrl } = require('../utils/validateUrl');
const { checkUrlReachability } = require('../utils/urlChecker');

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
 * Validates URL format and reachability, then generates a QR code.
 * No QR is generated unless both checks pass.
 */
const generateQR = async (req, res) => {
  try {
    const {
      url,
      foregroundColor = '#000000',
      backgroundColor = '#ffffff',
      size = 300,
      errorCorrectionLevel = 'H',
    } = req.body;

    // ── Step 1: Format validation ──────────────────────────────────────────
    const validation = validateUrl(url);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        error: validation.error,
      });
    }

    const normalizedUrl = validation.url;

    // ── Step 2: Real reachability check ───────────────────────────────────
    // QR is NOT generated unless this passes.
    const reach = await checkUrlReachability(normalizedUrl);
    if (!reach.reachable) {
      const msg =
        reach.message ||
        "We couldn't reach this link. Please make sure the website is available.";

      let statusCode = 422;
      if (msg.includes('security')) statusCode = 403;
      else if (msg.includes('too long')) statusCode = 408;

      console.log(
        `[QR] Reachability check failed for "${normalizedUrl}": ${msg}`
      );
      return res.status(statusCode).json({
        success: false,
        message: msg,
        error: msg,
      });
    }

    // ── Step 3: Validate and normalize options ─────────────────────────────
    const validECL = ['L', 'M', 'Q', 'H'];
    const ecl = validECL.includes(errorCorrectionLevel)
      ? errorCorrectionLevel
      : 'H';
    const qrSize = Math.min(Math.max(parseInt(size) || 300, 100), 1000);

    // ── Step 4: Generate QR data URL ─────────────────────────────────────
    const qrData = await generateQRDataUrl(normalizedUrl, {
      foregroundColor,
      backgroundColor,
      size: qrSize,
      errorCorrectionLevel: ecl,
    });

    return res.status(200).json({
      success: true,
      message: 'QR code generated successfully.',
      qrData,
      url: normalizedUrl,
    });
  } catch (err) {
    console.error('Generate QR error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate QR code. Please try again.',
      error: 'Failed to generate QR code. Please try again.',
    });
  }
};

module.exports = { generateQR };
