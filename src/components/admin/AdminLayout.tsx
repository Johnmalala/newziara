import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { AdminLayoutProvider } from '../../context/AdminLayoutContext';

const AdminLayout: React.FC = () => {
  return (
    <AdminLayoutProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminLayoutProvider>
  );
};

export default AdminLayout;
