import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ darkMode, setDarkMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-slate-200/60 dark:border-white/5 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ─── Logo ─────────────────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0" aria-label="QRSpark home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-200">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                QRSpark
              </span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 tracking-widest uppercase font-bold mt-0.5">
                A Free QR Generator
              </span>
            </div>
          </Link>

          {/* ─── Right actions ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </div>
    </header>
  );
}
