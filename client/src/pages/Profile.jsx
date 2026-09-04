import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, QrCode, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-mesh px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your QRSpark account information.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8"
        >
          {/* Avatar */}
          <div className="flex items-center gap-5 mb-8 pb-8 border-b border-slate-200/60 dark:border-slate-700/40">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-xl shadow-indigo-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || '—'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email || '—'}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                <Shield className="w-3 h-3" />
                Free Plan
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-5">
            {[
              { icon: User, label: 'Full Name', value: user?.name || '—' },
              { icon: Mail, label: 'Email Address', value: user?.email || '—' },
              { icon: Calendar, label: 'Member Since', value: joined },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
