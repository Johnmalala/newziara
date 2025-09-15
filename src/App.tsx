import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HomePage from './pages/HomePage';
import ToursPage from './pages/ToursPage';
import StaysPage from './pages/StaysPage';
import VolunteersPage from './pages/VolunteersPage';
import CustomPackagePage from './pages/CustomPackagePage';
import ProductDetailPage from './pages/ProductDetailPage';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListings from './pages/admin/AdminListings';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRequests from './pages/admin/AdminRequests';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  // --- DEVELOPMENT TOGGLE ---
  // Set to `true` to view the admin portal.
  // Set to `false` to view the public website.
  // IMPORTANT: Change this back to `window.location.hostname.startsWith('admin')` before deploying.
  const isAdminSubdomain = true;

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        {isAdminSubdomain ? <AdminRoutes /> : <PublicRoutes />}
      </Router>
    </AuthProvider>
  );
}

const AdminRoutes = () => (
  <Routes>
    <Route path="/login" element={<AdminLoginPage />} />
    <Route 
      path="/*" 
      element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="listings" element={<AdminListings />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="requests" element={<AdminRequests />} />
      <Route path="settings" element={<AdminSettings />} />
      {/* Redirect any other admin path to the admin dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);


const PublicRoutes = () => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/stays" element={<StaysPage />} />
        <Route path="/volunteers" element={<VolunteersPage />} />
        <Route path="/custom-package" element={<CustomPackagePage />} />
        <Route path="/listing/:id" element={<ProductDetailPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        {/* If someone tries to access /admin on the main domain, redirect them */}
        <Route path="/admin/*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
