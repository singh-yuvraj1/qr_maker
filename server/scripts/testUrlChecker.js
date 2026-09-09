/**
 * URL Reachability Test Script
 *
 * Run with: npm run test:url
 * This is SEPARATE from normal server startup (npm run dev).
 *
 * This script NEVER runs during normal development.
 * It exits after all tests complete.
 */

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { checkUrlReachability } = require('../utils/urlChecker');

// ─── Test cases ───────────────────────────────────────────────────────────────

const TEST_CASES = [
  // Should be reachable (real public sites)
  { url: 'https://google.com',           expect: true,  label: 'Google (should pass)' },
  { url: 'https://github.com',           expect: true,  label: 'GitHub (should pass)' },
  { url: 'https://httpbin.org/status/200', expect: true, label: 'HTTPBin 200 (should pass)' },
  { url: 'https://httpbin.org/status/301', expect: true, label: 'HTTPBin 301 redirect (should pass)' },
  { url: 'https://httpbin.org/status/403', expect: true, label: 'HTTPBin 403 (server exists, should pass)' },

  // Should be BLOCKED (private / SSRF)
  { url: 'http://localhost:5000',         expect: false, label: 'localhost (SSRF, should fail)' },
  { url: 'http://127.0.0.1:5000',        expect: false, label: '127.0.0.1 loopback (should fail)' },
  { url: 'http://192.168.1.1',           expect: false, label: '192.168.x.x private (should fail)' },
  { url: 'http://10.0.0.1',             expect: false, label: '10.x.x.x private (should fail)' },

  // Should be unreachable (DNS failure / nonexistent)
  { url: 'https://this-domain-does-not-exist-123456789.xyz', expect: false, label: 'Nonexistent domain (should fail)' },
  { url: 'https://fake-website-nxdomain-qrspark.invalid',    expect: false, label: 'Invalid TLD (should fail)' },

  // Should be invalid format
  { url: 'hello',                        expect: false, label: 'Malformed URL (should fail)' },
  { url: 'ftp://example.com',            expect: false, label: 'FTP scheme (should fail)' },
];

// ─── Runner ───────────────────────────────────────────────────────────────────

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

async function runTests() {
  console.log(`\n${BOLD}══════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}   QRSpark — URL Reachability Test Suite  ${RESET}`);
  console.log(`${BOLD}══════════════════════════════════════════${RESET}\n`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const tc of TEST_CASES) {
    process.stdout.write(`  Testing: ${tc.label}... `);
    try {
      const result = await checkUrlReachability(tc.url);
      const gotExpected = result.reachable === tc.expect;

      if (gotExpected) {
        console.log(`${GREEN}✓ PASS${RESET} (reachable=${result.reachable})`);
        passed++;
      } else {
        const detail = result.message ? ` — ${result.message}` : '';
        console.log(`${RED}✗ FAIL${RESET} (expected reachable=${tc.expect}, got ${result.reachable}${detail})`);
        failed++;
        failures.push({ label: tc.label, url: tc.url, expected: tc.expect, got: result.reachable, msg: result.message });
      }
    } catch (err) {
      console.log(`${RED}✗ ERROR${RESET} (${err.message || err})`);
      failed++;
      failures.push({ label: tc.label, url: tc.url, expected: tc.expect, got: 'ERROR', msg: err.message });
    }
  }

  console.log(`\n${BOLD}══════════════════════════════════════════${RESET}`);
  console.log(`  Results: ${GREEN}${passed} passed${RESET}, ${failed > 0 ? RED : ''}${failed} failed${RESET}`);

  if (failures.length > 0) {
    console.log(`\n${YELLOW}  Failed tests:${RESET}`);
    failures.forEach((f) => {
      console.log(`    - ${f.label}`);
      console.log(`      URL:      ${f.url}`);
      console.log(`      Expected: reachable=${f.expected}`);
      console.log(`      Got:      ${f.got}${f.msg ? ' | ' + f.msg : ''}`);
    });
  }

  console.log(`${BOLD}══════════════════════════════════════════${RESET}\n`);

  // Exit with error code if any test failed
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test runner error:', err);
  process.exit(1);
});
