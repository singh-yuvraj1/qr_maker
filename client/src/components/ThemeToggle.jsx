import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => setDarkMode(!darkMode)}
      className="p-3 rounded-xl glass text-slate-700 dark:text-slate-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 hover:bg-white/30 dark:hover:bg-slate-800/40 transition-all duration-300 shadow-md"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: darkMode ? 180 : 0, scale: [0.9, 1.1, 1] }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 fill-indigo-600/10" />
        )}
      </motion.div>
    </motion.button>
  );
}
