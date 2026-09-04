import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, Mail, Lock, User, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email address.';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setIsLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field) =>
    `input-base w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium disabled:opacity-60 ${
      fieldErrors[field] ? 'border-red-400 dark:border-red-500' : ''
    }`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-mesh flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mx-auto mb-4">
            <QrCode className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Join QRSpark and start generating QR codes
          </p>
        </div>

        <div className="glass-card rounded-3xl p-7 space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm font-medium"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-name" name="name" type="text" placeholder="Yuvraj Singh" value={form.name} onChange={handleChange} disabled={isLoading} autoComplete="name" className={inputClass('name')} />
              </div>
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{fieldErrors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} disabled={isLoading} autoComplete="email" className={inputClass('email')} />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{fieldErrors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-password" name="password" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} disabled={isLoading} autoComplete="new-password" className={`${inputClass('password')} pr-10`} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{fieldErrors.password}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input id="reg-confirm" name="confirm" type={showPw ? 'text' : 'password'} placeholder="Repeat password" value={form.confirm} onChange={handleChange} disabled={isLoading} autoComplete="new-password" className={inputClass('confirm')} />
              </div>
              {fieldErrors.confirm && <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{fieldErrors.confirm}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? {} : { scale: 1.02, y: -1 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed glow-primary"
            >
              {isLoading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
                : <><Sparkles className="w-4 h-4" />Create Free Account</>
              }
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
