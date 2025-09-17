import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AdminLayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export const AdminLayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const value = { isSidebarOpen, toggleSidebar, closeSidebar };

  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
};

export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext);
  if (context === undefined) {
    throw new Error('useAdminLayout must be used within an AdminLayoutProvider');
  }
  return context;
};
