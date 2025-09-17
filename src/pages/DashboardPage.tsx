import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Booking, Profile } from '../types';
import { format } from 'date-fns';
import { Loader, MapPin, Calendar, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import ChangeNameModal from '../components/dashboard/ChangeNameModal';
import ChangePasswordModal from '../components/dashboard/ChangePasswordModal';

const DashboardPage: React.FC = () => {
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(authProfile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!authProfile) return;
      setLoading(true);

      // Fetch full profile data including notification status
      const { data: fullProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authProfile.id)
        .single();
      
      if (profileError) {
        toast.error("Could not load your profile settings.");
      } else if (fullProfile) {
        setCurrentProfile(fullProfile);
        setNotificationsEnabled(fullProfile.email_notifications_enabled ?? true);
      }

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, listing:listings(*)')
        .eq('user_id', authProfile.id)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        toast.error('Could not fetch your bookings.');
      } else {
        setBookings(bookingsData as Booking[]);
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchInitialData();
    }
  }, [authProfile, authLoading]);

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (!currentProfile) return;
    setNotificationsEnabled(enabled); // Optimistic update
    const { error } = await supabase
      .from('profiles')
      .update({ email_notifications_enabled: enabled })
      .eq('id', currentProfile.id);

    if (error) {
      toast.error('Failed to update notification settings.');
      setNotificationsEnabled(!enabled); // Revert on failure
    } else {
      toast.success('Notification settings updated!');
    }
  };
  
  const handleNameUpdate = (newName: string) => {
    if (currentProfile) {
      setCurrentProfile({ ...currentProfile, full_name: newName });
    }
    // The AuthContext will update on next login/refresh
  };

  const isLoading = authLoading || loading;

  return (
    <>
      <ChangeNameModal 
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentName={currentProfile?.full_name || ''}
        onNameUpdate={handleNameUpdate}
      />
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      <div className="min-h-screen bg-gray-50">
        <section className="bg-primary text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
            <p className="text-xl text-red-100">Welcome back, {currentProfile?.full_name || 'Guest'}!</p>
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
                
                {isLoading ? <div className="flex justify-center p-4"><Loader className="animate-spin h-8 w-8 text-primary" /></div> : (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium text-gray-800">{currentProfile?.full_name}</p>
                      </div>
                      <button onClick={() => setIsNameModalOpen(true)} className="text-sm font-semibold text-primary hover:brightness-90">
                        Change
                      </button>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{currentProfile?.email}</p>
                      </div>
                    </div>

                    <div className="border-t pt-6 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your bookings.</p>
                      </div>
                      <ToggleSwitch enabled={notificationsEnabled} setEnabled={handleNotificationsToggle} ariaLabel="Toggle email notifications" />
                    </div>

                    <div className="border-t pt-6">
                      <button onClick={() => setIsPasswordModalOpen(true)} className="w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Change Password
                      </button>
                    </div>
                  </>
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
    </>
  );
};

export default DashboardPage;
