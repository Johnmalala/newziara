import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { loading, session, isAdmin, signOut } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // If this is an admin-only route and the user is logged in but is NOT an admin
  if (adminOnly && !isAdmin) {
    // Show a clear error message, sign the user out, and redirect to the login page.
    toast.error('Access Denied. Administrator privileges required.');
    signOut();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
