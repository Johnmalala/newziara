import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { List, UserCheck, Package, Users, Star } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState({ listings: 0, bookings: 0, requests: 0, partners: 0, users: 0, reviews: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: listingsCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });
      const { count: bookingsCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
      const { count: requestsCount } = await supabase.from('custom_package_requests').select('*', { count: 'exact', head: true });
      const { count: partnersCount } = await supabase.from('partners').select('*', { count: 'exact', head: true });
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: reviewsCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      setStats({
        listings: listingsCount ?? 0,
        bookings: bookingsCount ?? 0,
        requests: requestsCount ?? 0,
        partners: partnersCount ?? 0,
        users: usersCount ?? 0,
        reviews: reviewsCount ?? 0,
      });
    };
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  const statCards = [
    { title: 'Total Listings', value: stats.listings, icon: List, color: 'blue' },
    { title: 'Total Bookings', value: stats.bookings, icon: UserCheck, color: 'green' },
    { title: 'Custom Requests', value: stats.requests, icon: Package, color: 'orange' },
    { title: 'Partners', value: stats.partners, icon: Users, color: 'teal' },
    { title: 'Users', value: stats.users, icon: Users, color: 'purple' },
    { title: 'Reviews', value: stats.reviews, icon: Star, color: 'yellow' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome, {profile?.full_name}!</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">Here's a summary of your site's activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map(card => (
          <div key={card.title} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
            <div className={`bg-${card.color}-100 dark:bg-${card.color}-500/20 p-4 rounded-full mr-4`}>
              <card.icon className={`h-8 w-8 text-${card.color}-500 dark:text-${card.color}-300`} />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
