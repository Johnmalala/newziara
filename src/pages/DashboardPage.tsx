import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Booking } from '../types';
import { format } from 'date-fns';
import { User, Mail, Calendar, Loader, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, listing:listings(*)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchBookings();
    }
  }, [profile, authLoading]);

  const isLoading = authLoading || loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-xl text-red-100">Welcome back, {profile?.full_name || 'Guest'}!</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Profile</h2>
              {isLoading ? (
                <Loader className="animate-spin h-8 w-8 text-primary" />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-3" />
                    <span>{profile?.full_name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-500 mr-3" />
                    <span>{profile?.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bookings</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader className="animate-spin h-10 w-10 text-primary" />
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-6">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col md:flex-row items-center border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <img src={booking.listing?.images?.[0] || ''} alt={booking.listing?.title} className="w-full md:w-32 h-32 object-cover rounded-md mb-4 md:mb-0 md:mr-4" />
                      <div className="flex-grow">
                        <Link to={`/listing/${booking.listing_id}`} className="font-bold text-lg text-gray-800 hover:text-primary">{booking.listing?.title}</Link>
                        <p className="text-sm text-gray-500 flex items-center"><MapPin className="h-4 w-4 mr-1" />{booking.listing?.location}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          Booked for: {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                        </div>
                      </div>
                      <div className="text-right mt-4 md:mt-0">
                        <p className="font-bold text-lg text-primary">${booking.total_amount}</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.payment_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
                  <Link to="/tours" className="bg-primary text-white px-6 py-2 rounded-lg hover:brightness-90">Explore Tours</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
