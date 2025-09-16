import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { List, UserCheck, Package, ShieldCheck } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState({ listings: 0, bookings: 0, requests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
      const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { count: requestsCount } = await supabase.from('custom_package_requests').select('*', { count: 'exact', head: true });
      setStats({
        listings: listingsCount ?? 0,
        bookings: bookingsCount ?? 0,
        requests: requestsCount ?? 0,
      });
    };
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {profile?.full_name}!</h1>
      <p className="text-gray-600 mb-8">Here's a summary of your site's activity.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-purple-100 p-6 rounded-lg shadow-md flex items-center border-l-4 border-purple-500">
          <div className="bg-white p-4 rounded-full mr-4">
            <ShieldCheck className="h-8 w-8 text-purple-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Auth Status</p>
            <p className={`text-xl font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
              {isAdmin ? 'Admin' : 'Not Admin'}
            </p>
             <p className="text-xs text-gray-500">Role: {profile?.role}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-blue-100 p-4 rounded-full mr-4">
            <List className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Listings</p>
            <p className="text-3xl font-bold text-gray-800">{stats.listings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-green-100 p-4 rounded-full mr-4">
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-800">{stats.bookings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
          <div className="bg-orange-100 p-4 rounded-full mr-4">
            <Package className="h-8 w-8 text-orange-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Custom Requests</p>
            <p className="text-3xl font-bold text-gray-800">{stats.requests}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
