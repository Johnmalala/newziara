import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Booking, Profile, Listing } from '../types';
import { format } from 'date-fns';
import { Loader, MapPin, Calendar, Star, Heart, Settings, BookUser } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import ChangeNameModal from '../components/dashboard/ChangeNameModal';
import ChangePasswordModal from '../components/dashboard/ChangePasswordModal';
import ListingCard from '../components/ui/ListingCard';
import { useWishlist } from '../context/WishlistContext';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'wishlist' | 'settings'>('bookings');

  const tabs = [
    { id: 'bookings', label: 'My Bookings', icon: BookUser },
    { id: 'wishlist', label: 'My Wishlist', icon: Heart },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
          <p className="text-xl text-red-100">Manage your bookings, wishlist, and account settings.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 border-b border-gray-200">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <tab.icon className="mr-2 h-5 w-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div>
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'wishlist' && <WishlistTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </div>
        </div>
      </section>
    </div>
  );
};

const BookingsTab = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, listing:listings(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Could not fetch your bookings.');
      } else {
        setBookings(data as any);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [user]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Bookings</h2>
      {loading ? (
        <div className="flex justify-center items-center h-40"><Loader className="animate-spin h-10 w-10 text-primary" /></div>
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
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
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
  );
};

const WishlistTab = () => {
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchListings = async () => {
      if (wishlist.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .in('id', wishlist);
      
      if (error) {
        toast.error("Could not fetch your wishlist items.");
      } else {
        setListings(data as Listing[]);
      }
      setLoading(false);
    };

    if (!wishlistLoading) {
      fetchListings();
    }
  }, [wishlist, wishlistLoading]);
  
  const isLoading = wishlistLoading || loading;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Wishlist</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-40"><Loader className="animate-spin h-10 w-10 text-primary" /></div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing as any} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Your wishlist is empty.</p>
          <p className="text-sm text-gray-500">Click the heart icon on any listing to save it here.</p>
        </div>
      )}
    </div>
  );
};

const SettingsTab = () => {
  const { profile, loading: authLoading } = useAuth();
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(profile);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('id', profile.id).single();
      if (error) {
        toast.error("Could not load your profile settings.");
      } else if (data) {
        setCurrentProfile(data);
        setNotificationsEnabled(data.email_notifications_enabled ?? true);
      }
      setLoading(false);
    };
    if (!authLoading) fetchProfile();
  }, [profile, authLoading]);

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (!currentProfile) return;
    setNotificationsEnabled(enabled);
    const { error } = await supabase.from('profiles').update({ email_notifications_enabled: enabled }).eq('id', currentProfile.id);
    if (error) {
      toast.error('Failed to update notification settings.');
      setNotificationsEnabled(!enabled);
    } else {
      toast.success('Notification settings updated!');
    }
  };

  const handleNameUpdate = (newName: string) => {
    if (currentProfile) setCurrentProfile({ ...currentProfile, full_name: newName });
  };

  return (
    <>
      <ChangeNameModal isOpen={isNameModalOpen} onClose={() => setIsNameModalOpen(false)} currentName={currentProfile?.full_name || ''} onNameUpdate={handleNameUpdate} />
      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Account Settings</h2>
        {loading ? <div className="flex justify-center p-4"><Loader className="animate-spin h-8 w-8 text-primary" /></div> : (
          <>
            <div className="flex justify-between items-center">
              <div><p className="text-sm text-gray-500">Full Name</p><p className="font-medium text-gray-800">{currentProfile?.full_name}</p></div>
              <button onClick={() => setIsNameModalOpen(true)} className="text-sm font-semibold text-primary hover:brightness-90">Change</button>
            </div>
            <div className="flex justify-between items-center">
              <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-800">{currentProfile?.email}</p></div>
            </div>
            <div className="border-t pt-6 flex justify-between items-center">
              <div><p className="font-medium text-gray-800">Email Notifications</p><p className="text-sm text-gray-500">Receive updates about your bookings.</p></div>
              <ToggleSwitch enabled={notificationsEnabled} setEnabled={handleNotificationsToggle} ariaLabel="Toggle email notifications" />
            </div>
            <div className="border-t pt-6">
              <button onClick={() => setIsPasswordModalOpen(true)} className="w-full text-center py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">Change Password</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
