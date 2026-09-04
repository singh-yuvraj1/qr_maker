import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, LayoutDashboard, History, BarChart3, User, LogOut,
  LogIn, UserPlus, Menu, X, Sparkles, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/history',   label: 'History',   icon: History },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar({ darkMode, setDarkMode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'nav-link-active'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
    }`;

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
              {/* Force solid text in light mode so it's never invisible */}
              <span className="block text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                QRSpark
              </span>
              <span className="block text-[9px] text-slate-400 dark:text-slate-500 tracking-widest uppercase font-bold mt-0.5">
                Premium Generator
              </span>
            </div>
          </Link>

          {/* ─── Desktop nav ──────────────────────────────────────── */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* ─── Right actions ────────────────────────────────────── */}
          <div className="flex items-center gap-1.5">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-1">
                <NavLink to="/profile" className={linkClass}>
                  <User className="w-4 h-4" />
                  <span className="max-w-24 truncate">{user?.name?.split(' ')[0] || 'Profile'}</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200"
                >
                  <Sparkles className="w-4 h-4" />
                  Sign Up Free
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile menu ──────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200/60 dark:border-white/5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl overflow-hidden"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-3 space-y-0.5">
              {isAuthenticated && NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={() => setMobileOpen(false)} className={linkClass}>
                  <Icon className="w-4 h-4" />{label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <>
                  <NavLink to="/profile" onClick={() => setMobileOpen(false)} className={linkClass}>
                    <User className="w-4 h-4" />Profile
                  </NavLink>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <LogOut className="w-4 h-4" />Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <LogIn className="w-4 h-4" />Login
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                    <UserPlus className="w-4 h-4" />Register
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
