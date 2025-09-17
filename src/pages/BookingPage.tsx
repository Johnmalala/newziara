import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, CreditCard, Info, CheckCircle, MapPin, Loader, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Tables, TablesInsert } from '../types/supabase';
import AvailabilityCalendar from '../components/ui/AvailabilityCalendar';
import { useCurrency } from '../context/CurrencyContext';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';

type ListingWithPartner = Tables<'listings'> & {
  partner?: Tables<'partners'> | null;
};
type BookingInsert = TablesInsert<'bookings'>;
type Range = { start: string | null; end: string | null };

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, session } = useAuth();
  const { convertPrice } = useCurrency();
  const { listing: initialListing, selectedDate: initialDate, selectedRange: initialRange, guests } = (location.state || {}) as {
    listing: Tables<'listings'>;
    selectedDate: string;
    selectedRange: Range;
    guests: number;
  };

  const [listing, setListing] = useState<ListingWithPartner | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [selectedRange, setSelectedRange] = useState<Range>(initialRange || { start: null, end: null });
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookedDates, setBookedDates] = useState<string[]>([]);

  const isStay = listing?.category === 'stay';

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
    const fetchFullListingData = async () => {
      if (!initialListing?.id) return;

      const { data: listingData, error: listingError } = await supabase.from('listings').select('*').eq('id', initialListing.id).single();
      if (listingError || !listingData) { setListing(null); return; }

      let partnerData: Tables<'partners'> | null = null;
      if (listingData.partner_id) {
        const { data: pData } = await supabase.from('partners').select('*').eq('id', listingData.partner_id).single();
        partnerData = pData;
      }
      setListing({ ...listingData, partner: partnerData });

      const { data: bookingData } = await supabase.from('bookings').select('booking_date, check_out_date').eq('listing_id', initialListing.id);
      const allBookedDates: string[] = [];
      bookingData?.forEach(b => {
        if (b.check_out_date) {
          const start = parseISO(b.booking_date);
          const end = parseISO(b.check_out_date);
          for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
            allBookedDates.push(format(d, 'yyyy-MM-dd'));
          }
        } else {
          allBookedDates.push(b.booking_date);
        }
      });
      setBookedDates(allBookedDates);
    };
    fetchFullListingData();
  }, [initialListing?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  const numberOfNights = isStay && selectedRange.start && selectedRange.end 
    ? differenceInCalendarDays(parseISO(selectedRange.end), parseISO(selectedRange.start))
    : 1;
  const totalAmount = isStay 
    ? listing.price * Math.max(1, numberOfNights) * guests 
    : listing.price * guests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Please sign in to complete your booking.");
      navigate('/login', { state: { from: location } });
      return;
    }
    if ((isStay && !(selectedRange.start && selectedRange.end)) || (!isStay && !selectedDate)) {
      toast.error("Please select your dates from the calendar.");
      return;
    }
    setIsLoading(true);

    let commissionOwed: number | null = null;
    if (listing.partner && listing.partner.commission_rate) {
      commissionOwed = totalAmount * listing.partner.commission_rate;
    }

    const bookingData: BookingInsert = {
      listing_id: listing.id,
      user_id: user?.id,
      booking_date: isStay ? selectedRange.start! : selectedDate!,
      check_out_date: isStay ? selectedRange.end : null,
      total_amount: totalAmount,
      payment_plan: 'arrival',
      payment_status: 'pending',
      commission_owed: commissionOwed,
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">Your booking for <span className="font-semibold">{listing.title}</span> is confirmed. You will receive an email shortly.</p>
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
              <button type="submit" disabled={isLoading} className="w-full bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:brightness-90 flex items-center justify-center disabled:bg-gray-400">{isLoading ? <Loader className="animate-spin h-6 w-6" /> : <><CreditCard className="h-5 w-5 mr-2" />Confirm Booking</>}</button>
            </form>
          </motion.div></div>
          <div className="lg:col-span-1"><motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-28"><div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <img src={listing.images?.[0]} alt={listing.title} className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-4"><MapPin className="h-4 w-4 mr-1" />{listing.location}</div>
              <div className="space-y-4">
                {isStay ? (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-center p-2 border rounded-lg">
                        <label className="text-xs text-gray-500">CHECK-IN</label>
                        <p className="font-semibold">{selectedRange.start ? format(parseISO(selectedRange.start), 'dd MMM') : 'Select'}</p>
                      </div>
                      <div className="text-center p-2 border rounded-lg">
                        <label className="text-xs text-gray-500">CHECK-OUT</label>
                        <p className="font-semibold">{selectedRange.end ? format(parseISO(selectedRange.end), 'dd MMM') : 'Select'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-2 border rounded-lg">
                    <label className="text-xs text-gray-500">SELECTED DATE</label>
                    <p className="font-semibold">{selectedDate ? format(parseISO(selectedDate), 'dd MMM, yyyy') : 'Select a date'}</p>
                  </div>
                )}
              </div>
              <div className="border-t mt-6 pt-4">
                {isStay ? (
                  <>
                    <div className="flex justify-between items-center mb-2 text-gray-600"><span>{convertPrice(listing.price)} x {numberOfNights} nights</span><span>{convertPrice(listing.price * numberOfNights)}</span></div>
                    <div className="flex justify-between items-center mb-2 text-gray-600"><span>Guests</span><span>{guests}</span></div>
                  </>
                ) : (
                  <div className="flex justify-between items-center mb-2 text-gray-600"><span>{convertPrice(listing.price)} x {guests} person</span><span>{convertPrice(listing.price * guests)}</span></div>
                )}
                <div className="flex justify-between items-center font-bold text-lg mt-4"><span>Total (Pay on Arrival)</span><span className="text-primary">{convertPrice(totalAmount)}</span></div>
              </div>
            </div>
          </div></motion.div></div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
