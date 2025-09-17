import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 transition-colors duration-300 focus:outline-none"
      aria-label="Toggle theme"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
          style={theme === 'light' ? { left: '0.25rem' } : { right: '0.25rem' }}
        >
          {theme === 'light' ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-300" />}
        </motion.div>
      </AnimatePresence>
      <motion.div
        className="w-6 h-6 bg-white rounded-full shadow-md"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      />
    </button>
  );
};

export default ThemeToggle;
