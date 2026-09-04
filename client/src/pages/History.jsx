import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Trash2, QrCode, AlertCircle, SortAsc, SortDesc, X } from 'lucide-react';
import { qrService } from '../services/qrService';

export default function History() {
  const [qrs, setQrs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [deletingId, setDeletingId] = useState(null);

  const fetchQRs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await qrService.getAll({ search, sort });
      setQrs(data.qrs);
      setTotal(data.total);
    } catch {
      setError('Failed to load QR history.');
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    const t = setTimeout(fetchQRs, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [fetchQRs]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await qrService.deleteQR(id);
      setQrs(prev => prev.filter(q => q._id !== id));
      setTotal(prev => prev - 1);
    } catch {
      setError('Failed to delete QR code.');
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">QR History</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{total} QR code{total !== 1 ? 's' : ''} saved</p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search by name or URL…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base w-full pl-9 pr-4 py-2.5 rounded-xl text-sm"
              aria-label="Search QR codes"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSort(s => s === 'newest' ? 'oldest' : 'newest')}
            className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
            aria-label={`Sort by ${sort === 'newest' ? 'oldest' : 'newest'}`}
          >
            {sort === 'newest' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
            {sort === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        {/* QR list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-20 animate-pulse" />
            ))}
          </div>
        ) : qrs.length ? (
          <AnimatePresence initial={false}>
            <div className="space-y-3">
              {qrs.map((qr, i) => (
                <motion.div
                  key={qr._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12, height: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-card rounded-2xl p-4 flex items-center gap-4"
                >
                  {qr.qrData && (
                    <img src={qr.qrData} alt="" className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0 object-contain bg-white" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{qr.name || 'Unnamed QR'}</p>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">{qr.originalUrl}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(qr.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{qr.scanCount} scans</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => handleDownload(qr)} className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" aria-label={`Download ${qr.name || 'QR code'}`}>
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(qr._id)}
                      disabled={deletingId === qr._id}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50"
                      aria-label={`Delete ${qr.name || 'QR code'}`}
                    >
                      {deletingId === qr._id
                        ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                        : <Trash2 className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-16">
            <QrCode className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 stroke-[1.3]" />
            <p className="text-base font-bold text-slate-600 dark:text-slate-400">
              {search ? 'No results found' : 'No QR codes yet'}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {search ? 'Try a different search term.' : 'Generate your first QR code on the home page.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
