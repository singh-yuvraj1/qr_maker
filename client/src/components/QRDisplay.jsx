import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, QrCode, ShieldCheck, Copy, Check, Zap } from 'lucide-react';

// ─── Animated QR placeholder ─────────────────────────────────────────────────
function QRPlaceholder() {
  return (
    <div className="w-full flex flex-col items-center justify-center gap-3 py-6">
      {/* Simulated QR grid skeleton */}
      <div className="relative">
        <div className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 overflow-hidden qr-placeholder-grid">
          {/* Corner finders */}
          {[['top-3 left-3', 'rounded-tl-lg'], ['top-3 right-3', 'rounded-tr-lg'], ['bottom-3 left-3', 'rounded-bl-lg']].map(([pos, r], i) => (
            <div key={i} className={`absolute ${pos} w-9 h-9 border-4 border-slate-200 dark:border-slate-700 ${r}`} />
          ))}
          <div className="flex flex-col items-center gap-2 z-10">
            <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.3]" />
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center px-4 leading-snug">
              Your QR code will<br />appear here
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500">Enter a URL and click Generate</p>
    </div>
  );
}

export default function QRDisplay({ qrData, targetUrl, qrName, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData; // base64 data URL — works directly as PNG download

    let filename = 'qr-code';
    try {
      const parsed = new URL(targetUrl);
      filename = parsed.hostname.replace(/^www\./, '');
    } catch { /* use default */ }

    link.download = `${filename}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">

        {/* ── Loading ── */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-4 py-6"
          >
            <div className="relative w-48 h-48 sm:w-52 sm:h-52 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-800/30 flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 animate-pulse" />
              <div className="relative w-14 h-14 flex items-center justify-center mb-2">
                <span className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800" />
                <span className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
                <Zap className="w-5 h-5 text-indigo-500" />
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Generating…</p>
            </div>
          </motion.div>
        )}

        {/* ── QR Generated ── */}
        {!isLoading && qrData && (
          <motion.div
            key="qr"
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 12 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
            className="flex flex-col items-center gap-4 w-full"
          >
            {/* QR card */}
            <div className="relative group">
              <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 relative overflow-hidden">
                {/* Scan line — stays outside the img so the QR stays pristine */}
                <div
                  className="absolute left-0 right-0 h-0.5 bg-indigo-500/60 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                  style={{ animation: 'scan 3s ease-in-out infinite', top: '8px' }}
                />

                <img
                  src={qrData}
                  alt="Generated QR Code"
                  className="w-44 h-44 sm:w-48 sm:h-48 block object-contain rounded-xl relative z-10"
                  style={{ imageRendering: 'pixelated' }} /* keep QR crisp — no blur */
                />
              </div>

              {/* Verified badge */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold tracking-wider uppercase py-1 px-2.5 rounded-full flex items-center gap-1 shadow-md shadow-emerald-500/25 border border-emerald-400/40 z-20 whitespace-nowrap">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </div>
            </div>

            {/* QR name */}
            {qrName && (
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 text-center max-w-[200px] truncate">
                {qrName}
              </p>
            )}

            {/* URL chip */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/60 py-1.5 px-3 rounded-xl border border-slate-200/50 dark:border-slate-700/40 max-w-[220px]">
              <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-mono flex-1">
                {targetUrl}
              </span>
              <button
                onClick={handleCopy}
                className="p-0.5 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                aria-label="Copy URL"
                title="Copy URL"
              >
                {copied
                  ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                  : <Copy className="w-3.5 h-3.5" />
                }
              </button>
            </div>

            {/* Download */}
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleDownload}
              className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm shadow-lg shadow-slate-900/15 dark:shadow-white/5 hover:shadow-slate-900/25 transition-all duration-200"
              aria-label="Download QR code as PNG"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </motion.button>
          </motion.div>
        )}

        {/* ── Placeholder ── */}
        {!isLoading && !qrData && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QRPlaceholder />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes scan {
          0%   { top: 4px;  opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: calc(100% - 4px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
