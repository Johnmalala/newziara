import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAdminLayout } from '../../context/AdminLayoutContext';
import { LayoutDashboard, List, Settings, LogOut, MapPin, BookUser, Package, Users as UsersIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar: React.FC = () => {
  const { signOut, profile } = useAuth();
  const { isSidebarOpen, closeSidebar } = useAdminLayout();

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/listings', icon: List, text: 'Listings' },
    { to: '/bookings', icon: BookUser, text: 'Bookings' },
    { to: '/partners', icon: UsersIcon, text: 'Partners' },
    { to: '/users', icon: UsersIcon, text: 'Users' },
    { to: '/requests', icon: Package, text: 'Requests' },
    { to: '/settings', icon: Settings, text: 'Site Settings' },
  ];

  const SidebarContent = () => (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <div className="flex items-center">
          <MapPin className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold ml-2">Ziarazetu</span>
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-2 text-gray-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map(link => (
          <NavLink
            key={link.text}
            to={link.to}
            end
            onClick={closeSidebar}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-primary text-white' : 'hover:bg-gray-700'
              }`
            }
          >
            <link.icon className="h-5 w-5 mr-3" />
            {link.text}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-6 border-t border-gray-700">
        <div className="mb-4">
          <p className="text-sm font-semibold truncate">{profile?.full_name}</p>
          <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center px-4 py-2 rounded-lg text-left hover:bg-primary transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={closeSidebar}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 h-full z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
