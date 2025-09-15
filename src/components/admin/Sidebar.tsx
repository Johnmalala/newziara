import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, List, Settings, LogOut, MapPin } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { signOut, profile } = useAuth();

  const navLinks = [
    { to: '/admin', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/admin/listings', icon: List, text: 'Listings' },
    { to: '/admin/settings', icon: Settings, text: 'Site Settings' },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <MapPin className="h-8 w-8 text-red-500" />
        <span className="text-2xl font-bold ml-2">Ziarazetu</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map(link => (
          <NavLink
            key={link.text}
            to={link.to}
            end={link.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-red-600 text-white' : 'hover:bg-gray-700'
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
          <p className="text-sm font-semibold">{profile?.full_name}</p>
          <p className="text-xs text-gray-400">{profile?.email}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center px-4 py-2 rounded-lg text-left hover:bg-red-600 transition-colors duration-200"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
