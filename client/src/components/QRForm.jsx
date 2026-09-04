import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Trash2, Sparkles, AlertCircle, Settings2, ChevronDown, Info } from 'lucide-react';

// ─── QR Error Correction levels with full descriptions ────────────────────────
const ECL_OPTIONS = [
  { value: 'L', label: 'L', name: 'Low',      recovery: '~7%',  desc: 'Smallest file, least damage recovery' },
  { value: 'M', label: 'M', name: 'Medium',   recovery: '~15%', desc: 'Good balance of size and recovery' },
  { value: 'Q', label: 'Q', name: 'Quartile', recovery: '~25%', desc: 'Better recovery, slightly denser' },
  { value: 'H', label: 'H', name: 'High',     recovery: '~30%', desc: 'Best recovery, densest code — recommended for logos' },
];

const SIZE_OPTIONS = [
  { value: 200, label: '200px', tag: 'Small' },
  { value: 300, label: '300px', tag: 'Default' },
  { value: 400, label: '400px', tag: 'Large' },
  { value: 600, label: '600px', tag: 'XL' },
];

// ─── Button label by state ────────────────────────────────────────────────────
const BTN_LABELS = {
  idle:    { icon: <Sparkles className="w-4.5 h-4.5" />, text: 'Generate QR Code' },
  loading: { icon: <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />, text: 'Generating...' },
  success: { icon: null, text: '✓ QR Generated' },
  error:   { icon: null, text: '↺ Try Again' },
};

export default function QRForm({ onGenerate, onClear, isLoading, btnState = 'idle' }) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [showCustomize, setShowCustomize] = useState(false);

  // Customization
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [ecl, setEcl] = useState('H'); // Error Correction Level: L | M | Q | H

  // ─── URL Validation ────────────────────────────────────────────────────────
  const validateUrl = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return 'URL cannot be empty.';
    // Allow bare domains like "google.com" — backend normalises to https://
    try {
      const testUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      const parsed = new URL(testUrl);
      if (!parsed.hostname.includes('.')) return 'Please enter a valid domain (e.g. google.com).';
    } catch {
      return 'Please enter a valid URL (e.g. https://google.com).';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateUrl(url);
    if (validationError) { setError(validationError); return; }
    setError('');
    onGenerate({ url: url.trim(), name: name.trim(), foregroundColor, backgroundColor, size, errorCorrectionLevel: ecl });
  };

  const handleClear = () => {
    setUrl(''); setName(''); setError('');
    setForegroundColor('#000000'); setBackgroundColor('#ffffff');
    setSize(300); setEcl('H');
    setShowCustomize(false);
    onClear();
  };

  const isDisabled = isLoading || btnState === 'loading';
  const btn = BTN_LABELS[btnState] || BTN_LABELS.idle;

  const btnClass = btnState === 'success'
    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
    : btnState === 'error'
    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30'
    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30 glow-primary';

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>

      {/* ── URL Input ──────────────────────────────────────────────── */}
      <div>
        <label htmlFor="url-input" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
          Target URL
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Link2 className="w-4.5 h-4.5" />
          </div>
          <input
            id="url-input"
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
            disabled={isDisabled}
            autoComplete="url"
            className={`input-base w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium ${
              error ? 'border-red-400 dark:border-red-500 focus:border-red-500 !ring-red-300/30' : ''
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* ── Name Input ─────────────────────────────────────────────── */}
      <div>
        <label htmlFor="qr-name" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
          QR Name <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
        </label>
        <input
          id="qr-name"
          type="text"
          placeholder="e.g. My Portfolio"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isDisabled}
          maxLength={120}
          className="input-base w-full px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {/* ── Customization panel ────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustomize(!showCustomize)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors group"
          aria-expanded={showCustomize}
        >
          <Settings2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
          Customise QR Code
          <motion.span animate={{ rotate: showCustomize ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {showCustomize && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-4 glass-inner space-y-4">

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Foreground', value: foregroundColor, onChange: setForegroundColor, id: 'fg-color' },
                    { label: 'Background', value: backgroundColor, onChange: setBackgroundColor, id: 'bg-color' },
                  ].map(({ label, value, onChange, id }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                        {label}
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-9 h-9 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-600 shadow-sm flex-shrink-0 cursor-pointer">
                          <input
                            id={id}
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] cursor-pointer border-0 bg-transparent"
                            aria-label={`${label} color`}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
                          {value.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Size */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Output Size
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {SIZE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSize(opt.value)}
                        title={opt.label}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                          size === opt.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                            : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        {opt.tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── QR Error Correction Level ── */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      QR Error Correction
                    </label>
                    <div className="ecl-tooltip">
                      <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help" aria-hidden="true" />
                      <span className="ecl-tip" role="tooltip">
                        Higher correction = more damage-resistant QR,<br />but slightly larger/denser code.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {ECL_OPTIONS.map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setEcl(lvl.value)}
                        title={`${lvl.name} — ${lvl.recovery} recovery. ${lvl.desc}`}
                        aria-label={`Error correction ${lvl.name} (${lvl.recovery} recovery)`}
                        aria-pressed={ecl === lvl.value}
                        className={`flex flex-col items-center py-2 px-1 rounded-lg border transition-all duration-150 ${
                          ecl === lvl.value
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                            : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                      >
                        <span className="text-sm font-extrabold leading-none">{lvl.label}</span>
                        <span className={`text-[10px] mt-0.5 font-medium leading-none ${ecl === lvl.value ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                          {lvl.recovery}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{ECL_OPTIONS.find(e => e.value === ecl)?.name}</span> — {ECL_OPTIONS.find(e => e.value === ecl)?.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Action Buttons ─────────────────────────────────────────── */}
      <div className="flex gap-2.5 pt-1">
        <motion.button
          type="submit"
          disabled={isDisabled}
          whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
          whileTap={isDisabled ? {} : { scale: 0.97 }}
          className={`flex-1 py-3 px-5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${btnClass}`}
          aria-label="Generate QR code"
        >
          {btn.icon}
          {btn.text}
        </motion.button>

        <motion.button
          type="button"
          onClick={handleClear}
          disabled={isDisabled}
          whileHover={isDisabled ? {} : { scale: 1.02, y: -1 }}
          whileTap={isDisabled ? {} : { scale: 0.97 }}
          className="btn-secondary px-4 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Clear form"
        >
          <Trash2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          Clear
        </motion.button>
      </div>
    </form>
  );
}
