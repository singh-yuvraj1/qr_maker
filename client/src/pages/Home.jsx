import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import QRForm from '../components/QRForm';
import QRDisplay from '../components/QRDisplay';
import { useQR } from '../hooks/useQR';

// ─── Floating orbs background ────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}

// ─── Mouse-driven 3D tilt ─────────────────────────────────────────────────────
function use3DTilt(strength = 8) {
  const ref = useRef(null);
  const rafRef = useRef(null);
  const prefersReduced = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const handleMouseMove = useCallback((e) => {
    if (prefersReduced.current || !ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * strength;
      const rotY = dx * strength;
      ref.current.style.transform = `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
      ref.current.style.boxShadow = `
        ${-rotY * 2}px ${rotX * 2}px 40px rgba(99,102,241,0.12),
        0 24px 64px rgba(0,0,0,0.08)
      `;
    });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    ref.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    ref.current.style.boxShadow = '';
  }, []);

  useEffect(() => {
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}

export default function Home() {
  const { generateQR, isGenerating } = useQR();
  const [qrData, setQrData] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [qrName, setQrName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [btnState, setBtnState] = useState('idle'); // idle | loading | success | error
  const { ref: cardRef, handleMouseMove, handleMouseLeave } = use3DTilt(6);

  const handleGenerate = async (params) => {
    setErrorMsg('');
    setSuccessMsg('');
    // IMPORTANT: Clear any existing QR immediately so an old QR is never
    // left visible/downloadable while a new request is in flight.
    setQrData('');
    setTargetUrl('');
    setQrName('');
    setBtnState('loading');

    try {
      const result = await generateQR(params);
      // Only set QR data on confirmed success
      setQrData(result.qrData);
      setTargetUrl(result.url);
      setQrName(params.name || '');
      setSuccessMsg('URL is valid and reachable. QR code generated!');
      setBtnState('success');
      // Reset button after 2.5s
      setTimeout(() => setBtnState('idle'), 2500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'URL is invalid or unreachable.';
      setErrorMsg(msg);
      // Ensure QR is cleared on failure
      setQrData('');
      setTargetUrl('');
      setQrName('');
      setBtnState('error');
      setTimeout(() => setBtnState('idle'), 2500);
    }
  };

  const handleClear = () => {
    setQrData('');
    setTargetUrl('');
    setQrName('');
    setErrorMsg('');
    setSuccessMsg('');
    setBtnState('idle');
  };

  // Auto-dismiss alerts
  useEffect(() => {
    if (!successMsg && !errorMsg) return;
    const t = setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 6000);
    return () => clearTimeout(t);
  }, [successMsg, errorMsg]);

  return (
    <>
      <BackgroundOrbs />

      {/* Main: fills the space below the sticky navbar */}
      <main
        className="relative z-10 flex flex-col"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >
        {/* ── Alert banner (absolute, doesn't push layout) ── */}
        <div className="w-full max-w-5xl mx-auto px-4 pt-3">
          <AnimatePresence>
            {(successMsg || errorMsg) && (
              <motion.div
                key={successMsg ? 'success' : 'error'}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold shadow-md backdrop-blur-md mb-2 ${
                  successMsg
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50/90 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 text-red-800 dark:text-red-300'
                }`}
              >
                {successMsg
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                }
                <span>{successMsg || errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Hero + Card: centred vertically in remaining space ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4 pt-2">

          {/* Hero text — compact */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-center mb-5"
          >
            <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-widest mb-3 border border-indigo-200/60 dark:border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              A Free QR Generator
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Turn any link into a{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                QR code
              </span>
              .
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              High-resolution, customizable QR codes — verified, instant &amp; free. No login required.
            </p>
          </motion.div>

          {/* ── Main generator card ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="tilt-card glass-card w-full max-w-5xl rounded-3xl p-5 sm:p-7"
            style={{ transition: 'transform 0.15s ease, box-shadow 0.3s ease' }}
          >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">

              {/* ─── LEFT: Form ─────────────────────────────────── */}
              <div className="w-full lg:w-[58%] flex flex-col gap-4">
                <QRForm
                  onGenerate={handleGenerate}
                  onClear={handleClear}
                  isLoading={isGenerating}
                  btnState={btnState}
                />
              </div>

              {/* ─── Divider ─────────────────────────────────────── */}
              <div className="hidden lg:flex w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700/50 to-transparent" />
              <div className="lg:hidden h-px w-full bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700/50 to-transparent" />

              {/* ─── RIGHT: Preview ──────────────────────────────── */}
              <div className="w-full lg:w-[42%] flex items-center justify-center">
                <QRDisplay
                  qrData={qrData}
                  targetUrl={targetUrl}
                  qrName={qrName}
                  isLoading={isGenerating}
                />
              </div>
            </div>
          </motion.div>

        </div>

        {/* ── Footer — pinned to the bottom of main ── */}
        <footer className="w-full py-5 px-4 border-t border-slate-200/50 dark:border-white/5 mt-auto">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-1 text-center">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Made by{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Yuvraj Singh</span>
            </p>
            <a
              href="mailto:yuvraj.singh.95928@gmail.com"
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:underline transition-colors"
            >
              yuvraj.singh.95928@gmail.com
            </a>
            <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-0.5">
              &copy; {new Date().getFullYear()} QRSpark. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
