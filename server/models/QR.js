const mongoose = require('mongoose');

const qrSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [120, 'QR name cannot exceed 120 characters.'],
      default: '',
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required.'],
      trim: true,
    },
    // Store as base64 data URL: "data:image/png;base64,..."
    // This avoids filesystem management while keeping images retrievable
    qrData: {
      type: String,
      required: true,
    },
    foregroundColor: {
      type: String,
      default: '#000000',
    },
    backgroundColor: {
      type: String,
      default: '#ffffff',
    },
    size: {
      type: Number,
      default: 300,
      min: [100, 'Size must be at least 100px.'],
      max: [1000, 'Size cannot exceed 1000px.'],
    },
    errorCorrectionLevel: {
      type: String,
      enum: ['L', 'M', 'Q', 'H'],
      default: 'H',
    },
    scanCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient user-based queries
qrSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QR', qrSchema);
