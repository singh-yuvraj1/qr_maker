import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3, Scan, QrCode, AlertCircle } from 'lucide-react';
import { qrService } from '../services/qrService';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#e0e7ff'];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{label}</p>
      <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">{payload[0].value} scans</p>
    </div>
  );
}

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qrService.getStats()
      .then(setStats)
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats?.scansByQR?.map(qr => ({
    name: qr.name || qr.originalUrl.replace(/^https?:\/\/(www\.)?/, '').slice(0, 20),
    scans: qr.scanCount,
    fullName: qr.name || qr.originalUrl,
  })) || [];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-mesh px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track performance across your QR codes.</p>
        </motion.div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: QrCode, label: 'Total QR Codes', value: stats?.totalQRs, color: 'bg-indigo-500' },
            { icon: Scan, label: 'Total Scans', value: stats?.totalScans, color: 'bg-purple-500' },
            { icon: BarChart3, label: 'This Month', value: stats?.thisMonthQRs, color: 'bg-pink-500' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {loading ? <span className="inline-block w-8 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /> : (value ?? 0)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Scans per QR Code</h2>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : chartData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={52}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="scans" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
              <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-600 stroke-[1.3]" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No scan data yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Generate and share some QR codes to see analytics here.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
