import React from 'react';
import { Menu } from 'lucide-react';
import { useAdminLayout } from '../../context/AdminLayoutContext';
import { useLocation } from 'react-router-dom';

const AdminHeader: React.FC = () => {
  const { toggleSidebar } = useAdminLayout();
  const location = useLocation();

  // A simple function to get a user-friendly title from the path
  const getPageTitle = () => {
    const path = location.pathname.split('/').pop() || 'dashboard';
    if (path.match(/^[0-9a-f-]{36}$/)) return 'Edit Listing'; // UUID check
    if (path === 'new') return 'New Listing';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="lg:hidden bg-white shadow-md sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-16">
        <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:text-primary">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
        <div className="w-8"></div> {/* Spacer */}
      </div>
    </header>
  );
};

export default AdminHeader;
