import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Scan, TrendingUp, Calendar, Download, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { qrService } from '../services/qrService';
import { Link } from 'react-router-dom';

function StatCard({ icon: Icon, label, value, color = 'indigo', delay = 0 }) {
  const colors = {
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/20',
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/20',
    rose: 'from-rose-500 to-pink-600 shadow-rose-500/20',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">{value ?? '—'}</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    qrService.getStats()
      .then(data => setStats(data))
      .catch(() => setError('Failed to load dashboard stats.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (qr) => {
    if (!qr.qrData) return;
    const link = document.createElement('a');
    link.href = qr.qrData;
    link.download = `${qr.name || 'qr-code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-mesh px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's an overview of your QR activity.</p>
        </motion.div>

        {error && (
          <div className="mb-6 flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 h-24 animate-pulse bg-slate-100/50 dark:bg-slate-800/30" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={QrCode} label="Total QR Codes" value={stats?.totalQRs} color="indigo" delay={0} />
            <StatCard icon={Scan} label="Total Scans" value={stats?.totalScans} color="emerald" delay={0.05} />
            <StatCard icon={Calendar} label="This Month" value={stats?.thisMonthQRs} color="amber" delay={0.1} />
            <StatCard icon={TrendingUp} label="Most Scanned" value={stats?.mostScanned?.scanCount ?? 0} color="rose" delay={0.15} />
          </div>
        )}

        {/* Recent QRs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent QR Codes</h2>
            <Link to="/history" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-pulse bg-slate-100 dark:bg-slate-800/40" />)}
            </div>
          ) : stats?.recentQRs?.length ? (
            <div className="space-y-3">
              {stats.recentQRs.map((qr) => (
                <div key={qr._id} className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/50 dark:border-slate-700/30 hover:border-indigo-300/50 dark:hover:border-indigo-700/40 transition-colors group">
                  {qr.qrData && (
                    <img src={qr.qrData} alt="" className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0 object-contain bg-white" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{qr.name || 'Unnamed QR'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">{qr.originalUrl}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      {qr.scanCount} scans
                    </span>
                    <button onClick={() => handleDownload(qr)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" aria-label="Download QR">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3 stroke-[1.3]" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No QR codes yet</p>
              <Link to="/" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Generate your first QR →
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
