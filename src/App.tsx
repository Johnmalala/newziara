import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { CurrencyProvider } from './context/CurrencyContext';

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
import ListingFormPage from './pages/admin/ListingFormPage';
import AdminBookings from './pages/admin/AdminBookings';
import AdminRequests from './pages/admin/AdminRequests';
import AdminSettings from './pages/admin/AdminSettings';
import AdminPartners from './pages/admin/AdminPartners';
import AdminUsers from './pages/admin/AdminUsers'; // Import the new Users page
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  const isAdminSubdomain = false;

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        {isAdminSubdomain ? <AdminRoutes /> : <PublicSite />}
      </Router>
    </AuthProvider>
  );
}

const AdminRoutes = () => (
  <Routes>
    <Route path="/login" element={<AdminLoginPage />} />
    <Route 
      path="/" 
      element={
        <ProtectedRoute adminOnly>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="listings" element={<AdminListings />} />
      <Route path="listings/new" element={<ListingFormPage />} />
      <Route path="listings/edit/:id" element={<ListingFormPage />} />
      <Route path="bookings" element={<AdminBookings />} />
      <Route path="requests" element={<AdminRequests />} />
      <Route path="partners" element={<AdminPartners />} />
      <Route path="users" element={<AdminUsers />} /> {/* Add the new Users route */}
      <Route path="settings" element={<AdminSettings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Route>
  </Routes>
);

const PublicSite = () => (
  <SettingsProvider>
    <CurrencyProvider>
      <ThemedPublicRoutes />
    </CurrencyProvider>
  </SettingsProvider>
);

const ThemedPublicRoutes = () => {
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <style>
        {`
          :root {
            --color-primary: ${settings?.primary_color || '#dc2626'};
          }
        `}
      </style>
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
          <Route path="/admin/*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
