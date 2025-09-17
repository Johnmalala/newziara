import React, { useState } from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAdminLayout } from '../../context/AdminLayoutContext';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

const AdminHeader: React.FC = () => {
  const { toggleSidebar } = useAdminLayout();
  const { profile, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="lg:hidden bg-white dark:bg-gray-800 shadow-md dark:shadow-none dark:border-b dark:border-gray-700 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Left side: Hamburger Menu */}
        <button onClick={toggleSidebar} className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary">
          <Menu className="h-6 w-6" />
        </button>

        {/* Right side: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                >
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                        {profile?.full_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
                        {profile?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
