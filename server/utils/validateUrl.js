/**
 * URL Validation and Normalization Utility
 */

const VALID_SCHEMES = ['http:', 'https:'];

/**
 * Normalizes a URL by adding https:// if no scheme is present.
 * e.g. "google.com" → "https://google.com"
 */
const normalizeUrl = (input) => {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Already has a scheme
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https:// prefix
  return `https://${trimmed}`;
};

/**
 * Validates a URL string.
 * Returns { valid: true, url: normalizedUrl } or { valid: false, error: string }
 */
const validateUrl = (input) => {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'URL is required.' };
  }

  const normalized = normalizeUrl(input);

  if (!normalized) {
    return { valid: false, error: 'URL cannot be empty.' };
  }

  // Max length guard
  if (normalized.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters).' };
  }

  try {
    const parsed = new URL(normalized);

    if (!VALID_SCHEMES.includes(parsed.protocol)) {
      return {
        valid: false,
        error: 'Only http:// and https:// URLs are supported.',
      };
    }

    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return {
        valid: false,
        error: 'Please enter a valid URL with a proper domain (e.g. https://google.com).',
      };
    }

    return { valid: true, url: normalized };
  } catch {
    return {
      valid: false,
      error: 'Invalid URL format. Please enter a valid URL (e.g. https://google.com).',
    };
  }
};

module.exports = { validateUrl, normalizeUrl };
