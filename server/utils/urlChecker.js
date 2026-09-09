/**
 * URL Reachability Checker
 *
 * Verifies that a URL is a reachable public HTTP/HTTPS endpoint.
 * Security features:
 *   - SSRF protection: resolves hostname to IP and blocks private/loopback ranges
 *   - Redirect re-validation: re-checks every redirect destination for SSRF
 *   - HEAD → GET fallback: avoids downloading large bodies
 *   - Hard 5-second timeout via AbortController
 *   - User-friendly error messages — no internal details exposed
 */

'use strict';

const dns   = require('dns').promises;
const http  = require('http');
const https = require('https');
const net   = require('net');

// ─── SSRF Blocklists ──────────────────────────────────────────────────────────

/** Block these hostnames outright before DNS lookup. */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal', // GCP metadata
]);

/** Cloud/metadata hostnames that should be blocked. */
const BLOCKED_HOSTNAME_PATTERNS = [
  /\.internal$/i,
  /\.local$/i,
];

/**
 * Returns true if the resolved IP address is in a private/restricted range.
 * Covers: loopback, private RFC-1918, link-local, ::1, cloud metadata (169.254.x.x).
 */
function isPrivateIp(ip) {
  // IPv6 loopback
  if (ip === '::1' || ip === '0:0:0:0:0:0:0:1') return true;

  // Normalize IPv4-mapped IPv6  (::ffff:192.168.x.x)
  const ipv4Match = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  const normalizedIp = ipv4Match ? ipv4Match[1] : ip;

  if (net.isIPv4(normalizedIp)) {
    const parts = normalizedIp.split('.').map(Number);
    const [a, b] = parts;

    // 127.0.0.0/8  — loopback
    if (a === 127) return true;
    // 10.0.0.0/8   — private
    if (a === 10) return true;
    // 172.16.0.0/12 — private
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 — private
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 — link-local / AWS+GCP metadata endpoint
    if (a === 169 && b === 254) return true;
    // 0.0.0.0/8
    if (a === 0) return true;
    // 100.64.0.0/10 — shared address space (carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 192.0.0.0/24 — IANA special-purpose
    if (a === 192 && b === 0 && parts[2] === 0) return true;
  }

  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    // fc00::/7  — unique local
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // fe80::/10 — link-local
    if (lower.startsWith('fe8') || lower.startsWith('fe9') ||
        lower.startsWith('fea') || lower.startsWith('feb')) return true;
    // 2001:db8::/32 — documentation
    if (lower.startsWith('2001:db8')) return true;
  }

  return false;
}

/**
 * Validates a hostname for SSRF safety.
 * Throws a structured error if the hostname is blocked.
 */
async function assertSafeHostname(hostname) {
  const h = hostname.toLowerCase();

  // Block by exact hostname
  if (BLOCKED_HOSTNAMES.has(h)) {
    throw { code: 'BLOCKED', message: 'This destination cannot be verified for security reasons.' };
  }

  // Block by pattern (.local, .internal, etc.)
  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(h)) {
      throw { code: 'BLOCKED', message: 'This destination cannot be verified for security reasons.' };
    }
  }

  // Resolve hostname → IP and check for private ranges
  let addresses;
  try {
    // Use lookup (respects /etc/hosts) rather than resolve for accuracy
    const result = await dns.lookup(hostname, { all: true });
    addresses = result.map((r) => r.address);
  } catch (err) {
    // DNS resolution failure
    throw {
      code: 'DNS_FAIL',
      message: "We couldn't find this website. Please check the link and try again.",
    };
  }

  if (!addresses || addresses.length === 0) {
    throw {
      code: 'DNS_FAIL',
      message: "We couldn't find this website. Please check the link and try again.",
    };
  }

  for (const addr of addresses) {
    if (isPrivateIp(addr)) {
      throw {
        code: 'BLOCKED',
        message: 'This destination cannot be verified for security reasons.',
      };
    }
  }
}

// ─── HTTP Request helper ──────────────────────────────────────────────────────

const TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 5;

/**
 * Makes a lightweight HTTP/HTTPS request and returns { statusCode, headers, location }.
 * Does NOT download the response body (destroys the socket after headers arrive).
 *
 * @param {string} url
 * @param {'HEAD'|'GET'} method
 * @param {AbortSignal} signal
 * @returns {Promise<{ statusCode: number, headers: object, location: string|null }>}
 */
function httpRequest(url, method, signal) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const lib = parsedUrl.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; QRSpark-Checker/1.0)',
        'Accept': '*/*',
        'Connection': 'close',
        ...(method === 'GET' ? { 'Range': 'bytes=0-1023' } : {}),
      },
      timeout: TIMEOUT_MS,
      // Don't fail on invalid certs for purely reachability purposes,
      // but do flag it via an error if needed
      rejectUnauthorized: false,
    };

    const req = lib.request(options, (res) => {
      const location = res.headers['location'] || null;
      // Immediately destroy — we only need headers
      res.destroy();
      resolve({ statusCode: res.statusCode, headers: res.headers, location });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({ code: 'TIMEOUT', message: 'The link took too long to respond. Please try again.' });
    });

    req.on('error', (err) => {
      reject(err);
    });

    // AbortSignal support
    if (signal) {
      signal.addEventListener('abort', () => {
        req.destroy();
        reject({ code: 'TIMEOUT', message: 'The link took too long to respond. Please try again.' });
      }, { once: true });
    }

    req.end();
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Checks whether a URL is publicly reachable.
 *
 * @param {string} url  A syntactically valid http/https URL (already normalized).
 * @returns {Promise<{ reachable: boolean, message?: string }>}
 */
async function checkUrlReachability(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { reachable: false, message: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { reachable: false, message: 'Please enter a valid HTTP or HTTPS URL.' };
  }

  // ── Phase 1: SSRF guard on origin hostname ─────────────────────────────────
  try {
    await assertSafeHostname(parsed.hostname);
  } catch (err) {
    return { reachable: false, message: err.message || 'This destination cannot be verified for security reasons.' };
  }

  // ── Phase 2: Attempt request (HEAD then GET fallback) with redirect tracking ─
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS + 500); // safety net

  let currentUrl = url;
  let redirectCount = 0;
  let useGet = false;

  try {
    while (true) {
      let result;
      try {
        result = await httpRequest(currentUrl, useGet ? 'GET' : 'HEAD', controller.signal);
      } catch (reqErr) {
        if (reqErr.code === 'TIMEOUT') {
          return { reachable: false, message: 'The link took too long to respond. Please try again.' };
        }
        if (reqErr.code === 'BLOCKED') {
          return { reachable: false, message: reqErr.message };
        }

        // HEAD not supported or network error — fall back to GET once
        if (!useGet) {
          useGet = true;
          continue;
        }

        // Both HEAD and GET failed — classify the error
        const code = reqErr.code || '';
        if (
          code === 'ENOTFOUND' ||
          code === 'EAI_AGAIN' ||
          code === 'EAI_NONAME'
        ) {
          return { reachable: false, message: "We couldn't find this website. Please check the link and try again." };
        }
        if (
          code === 'ECONNREFUSED' ||
          code === 'ECONNRESET' ||
          code === 'EHOSTUNREACH' ||
          code === 'ENETUNREACH'
        ) {
          return { reachable: false, message: "We couldn't reach this link. Please make sure the website is available." };
        }
        if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
          return { reachable: false, message: 'The link took too long to respond. Please try again.' };
        }

        return { reachable: false, message: "We couldn't reach this link. Please make sure the website is available." };
      }

      const { statusCode, location } = result;

      // ── HEAD returned 405 (method not allowed) — switch to GET ──────────────
      if (!useGet && statusCode === 405) {
        useGet = true;
        continue;
      }

      // ── Redirect handling ────────────────────────────────────────────────────
      if (statusCode >= 300 && statusCode < 400 && location) {
        if (redirectCount >= MAX_REDIRECTS) {
          return { reachable: false, message: "We couldn't reach this link. Too many redirects." };
        }

        // Resolve the redirect URL (may be relative)
        let redirectUrl;
        try {
          redirectUrl = new URL(location, currentUrl).href;
        } catch {
          return { reachable: false, message: "We couldn't reach this link. Invalid redirect URL." };
        }

        // SSRF guard on redirect destination
        let redirectParsed;
        try {
          redirectParsed = new URL(redirectUrl);
        } catch {
          return { reachable: false, message: "We couldn't reach this link. Invalid redirect URL." };
        }

        // Only follow http/https redirects
        if (redirectParsed.protocol !== 'http:' && redirectParsed.protocol !== 'https:') {
          // Non-http redirect target — but the origin server DID respond, so it's reachable
          return { reachable: true };
        }

        try {
          await assertSafeHostname(redirectParsed.hostname);
        } catch (err) {
          return { reachable: false, message: err.message };
        }

        currentUrl = redirectUrl;
        redirectCount++;
        continue;
      }

      // ── Any HTTP response (including 4xx) means the server exists ────────────
      // We do NOT require 200; 401, 403, 404, 405, 429, etc. all mean the server replied.
      return { reachable: true };
    }
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { checkUrlReachability };
