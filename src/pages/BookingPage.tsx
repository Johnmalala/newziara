import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, CreditCard, Info, CheckCircle, MapPin, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Tables, TablesInsert } from '../types/supabase';
import AvailabilityCalendar from '../components/ui/AvailabilityCalendar';
import { useCurrency } from '../context/CurrencyContext';

type Listing = Tables<'listings'>;
type BookingInsert = TablesInsert<'bookings'>;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, session } = useAuth();
  const { convertPrice } = useCurrency();
  const { listing, selectedDate: initialDate, guests } = (location.state || {}) as {
    listing: Listing;
    selectedDate: string;
    guests: number;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.full_name || '',
        email: profile.email || '',
        phone: '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchBookedDates = async () => {
      if (!listing) return;
      const { data } = await supabase.from('bookings').select('booking_date').eq('listing_id', listing.id);
      setBookedDates(data?.map(b => b.booking_date) || []);
    };
    fetchBookedDates();
  }, [listing]);

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No listing selected.</h2>
          <Link to="/" className="bg-primary text-white px-6 py-3 rounded-lg hover:brightness-90">Return to Home</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to complete your booking.");
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!selectedDate) {
      toast.error("Please select a date from the calendar.");
      return;
    }
    setIsLoading(true);

    const bookingData: BookingInsert = {
      listing_id: listing.id,
      user_id: user?.id,
      booking_date: selectedDate,
      total_amount: listing.price * guests, // Always store in base currency (USD)
      payment_plan: 'arrival',
      payment_status: 'pending',
    };

    const { error } = await supabase.from('bookings').insert(bookingData);

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success("Booking confirmed!");
      setIsSubmitted(true);
    }
  };

  const totalAmountInUsd = listing.price * guests;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your booking for <span className="font-semibold">{listing.title}</span> on <span className="font-semibold">{selectedDate}</span> is confirmed. You will receive an email shortly.</p>
          <button onClick={() => navigate('/')} className="bg-primary text-white px-8 py-3 rounded-lg hover:brightness-90 w-full">Explore More</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-gray-600 hover:text-primary mb-6"><ArrowLeft className="h-4 w-4 mr-2" />Back</button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Confirm Your Booking</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Your Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" /></div></div>
                <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" /></div></div>
              </div>
              <div><label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" /><input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary" /></div></div>
              <div className="!mt-8"><h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Payment Information</h2><div className="bg-red-50 border-l-4 border-primary text-red-800 p-4 mt-4 rounded-r-lg"><div className="flex"><Info className="h-5 w-5 text-primary mr-3 mt-1" /><div><p className="font-bold">Pay on Arrival</p><p className="text-sm">No payment is needed today. You will pay in person upon arrival.</p></div></div></div></div>
              <button type="submit" disabled={isLoading || !selectedDate} className="w-full bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:brightness-90 flex items-center justify-center disabled:bg-gray-400">{isLoading ? <Loader className="animate-spin h-6 w-6" /> : <><CreditCard className="h-5 w-5 mr-2" />Confirm Booking</>}</button>
            </form>
          </motion.div></div>
          <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28"><div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={listing.images?.[0]} alt={listing.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-4"><MapPin className="h-4 w-4 mr-1" />{listing.location}</div>
              <div className="space-y-4"><AvailabilityCalendar availableDates={listing.availability as string[] | undefined} bookedDates={bookedDates} selectedDate={selectedDate} onDateSelect={setSelectedDate} />{!selectedDate && <p className="text-primary text-sm font-medium text-center">Please select a date to continue.</p>}</div>
              <div className="border-t mt-6 pt-4">
                <div className="flex justify-between items-center mb-2 text-gray-600"><span>{listing.category === 'stay' ? 'Nights' : 'Guests'}</span><span>{guests}</span></div>
                <div className="flex justify-between items-center mb-2 text-gray-600"><span>Price per {listing.category === 'stay' ? 'night' : 'person'}</span><span>{convertPrice(listing.price)}</span></div>
                <div className="flex justify-between items-center font-bold text-lg mt-4"><span>Total (Pay on Arrival)</span><span className="text-primary">{convertPrice(totalAmountInUsd)}</span></div>
              </div>
            </div>
          </div></motion.div></div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
