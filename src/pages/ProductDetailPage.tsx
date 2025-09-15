import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Star, Users, Check, X, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Shield, Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';
import AvailabilityCalendar from '../components/ui/AvailabilityCalendar';

type Listing = Tables<'listings'>;
type Booking = Tables<'bookings'>;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchListingData = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data: listingData, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (listingError || !listingData) {
        setListing(null);
      } else {
        setListing(listingData);
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('booking_date')
          .eq('listing_id', id);
        
        setBookedDates(bookingData?.map(b => b.booking_date) || []);
      }
      
      setLoading(false);
      setSelectedDate(null);
    };

    fetchListingData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-red-600" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <Link to="/" className="text-red-600 hover:text-red-700">Return to home</Link>
      </div>
    );
  }

  const images = listing.images || ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'];
  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);
  const isBookingDisabled = !selectedDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to={`/${listing.category === 'tour' ? 'tours' : listing.category === 'stay' ? 'stays' : 'volunteers'}`}
            className="inline-flex items-center text-gray-600 hover:text-red-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {listing.category}s
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative h-96 md:h-[500px]">
                <img src={images[currentImageIndex]} alt={listing.title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"><ChevronLeft className="h-6 w-6 text-gray-800" /></button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2"><ChevronRight className="h-6 w-6 text-gray-800" /></button>
                  </>
                )}
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">{currentImageIndex + 1} / {images.length}</div>
                <div className="absolute top-4 left-4"><span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium capitalize">{listing.category}</span></div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white/80 hover:bg-white rounded-full p-2"><Heart className="h-5 w-5 text-gray-700" /></button>
                  <button className="bg-white/80 hover:bg-white rounded-full p-2"><Share2 className="h-5 w-5 text-gray-700" /></button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4"><div className="flex space-x-2 overflow-x-auto">
                  {images.map((img, i) => <button key={i} onClick={() => setCurrentImageIndex(i)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${i === currentImageIndex ? 'border-red-600' : 'border-gray-200'}`}><img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" /></button>)}
                </div></div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4"><MapPin className="h-5 w-5 mr-2" /><span>{listing.location}</span></div>
                  {listing.rating && <div className="flex items-center"><Star className="h-5 w-5 text-yellow-500 fill-current mr-1" /><span className="font-semibold text-gray-900">{listing.rating}</span><span className="text-gray-500 ml-2">(127 reviews)</span></div>}
                </div>
                <div className="text-right"><div className="text-3xl font-bold text-red-600">${listing.price}</div><div className="text-sm text-gray-500">{listing.category === 'stay' ? 'per night' : 'per person'}</div></div>
              </div>
              <div className="prose max-w-none"><p className="text-gray-700 leading-relaxed">{listing.description}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center"><Clock className="h-5 w-5 text-red-600 mr-2" /><div><div className="font-medium">Duration</div><div className="text-sm text-gray-600">{listing.category === 'tour' ? '3-5 Days' : listing.category === 'volunteer' ? '2-4 Weeks' : 'Flexible'}</div></div></div>
                <div className="flex items-center"><Users className="h-5 w-5 text-red-600 mr-2" /><div><div className="font-medium">Group Size</div><div className="text-sm text-gray-600">{listing.category === 'stay' ? '1-4 Guests' : '2-12 People'}</div></div></div>
                <div className="flex items-center"><Shield className="h-5 w-5 text-red-600 mr-2" /><div><div className="font-medium">Booking</div><div className="text-sm text-gray-600">Pay on Arrival</div></div></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-700 mb-4 flex items-center"><Check className="h-5 w-5 mr-2" />Included</h3>
                  <ul className="space-y-2">{listing.inclusions?.map((item, i) => <li key={i} className="flex items-start"><Check className="h-4 w-4 text-green-600 mr-2 mt-1 flex-shrink-0" /><span>{item}</span></li>)}</ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center"><X className="h-5 w-5 mr-2" />Not Included</h3>
                  <ul className="space-y-2">{listing.exclusions?.map((item, i) => <li key={i} className="flex items-start"><X className="h-4 w-4 text-red-600 mr-2 mt-1 flex-shrink-0" /><span>{item}</span></li>)}</ul>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
            <div className="sticky top-28"><div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6"><div className="text-3xl font-bold text-red-600">${listing.price}</div><div className="text-sm text-gray-500">{listing.category === 'stay' ? 'per night' : 'per person'}</div></div>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label><AvailabilityCalendar availableDates={listing.availability as string[] | undefined} bookedDates={bookedDates} selectedDate={selectedDate} onDateSelect={setSelectedDate} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{listing.category === 'stay' ? 'Guests' : 'Travellers'}</label><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? (listing.category === 'stay' ? 'Guest' : 'Traveller') : (listing.category === 'stay' ? 'Guests' : 'Travellers')}</option>)}</select></div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2"><span className="text-gray-600">${listing.price} x {guests} {listing.category === 'stay' ? 'night' : 'person'}</span><span className="font-medium">${(listing.price * guests).toFixed(2)}</span></div>
                  <div className="flex justify-between items-center font-bold text-lg"><span>Total</span><span className="text-red-600">${(listing.price * guests).toFixed(2)}</span></div>
                </div>
                <Link to={!isBookingDisabled ? "/booking" : '#'} state={{ listing, selectedDate, guests }} aria-disabled={isBookingDisabled} className={`block w-full text-center bg-red-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-700 ${isBookingDisabled ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''}`}>Book Now - Pay on Arrival</Link>
                <div className="text-center text-sm text-gray-500">{selectedDate ? `You won't be charged until arrival.` : 'Please select a date to book.'}</div>
              </div>
            </div></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
