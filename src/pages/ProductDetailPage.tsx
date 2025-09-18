import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Star, Users, Check, X, ChevronLeft, ChevronRight,
  Heart, Share2, Clock, Shield, Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';
import AvailabilityCalendar from '../components/ui/AvailabilityCalendar';
import { useCurrency } from '../context/CurrencyContext';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import ReviewCard from '../components/ui/ReviewCard';
import { useWishlist } from '../context/WishlistContext'; // Import useWishlist
import { useAuth } from '../context/AuthContext'; // Import useAuth
import toast from 'react-hot-toast';

type Listing = Tables<'listings'>;
type Range = { start: string | null; end: string | null };
type ReviewWithProfile = Tables<'reviews'> & {
  profile: { full_name: string | null } | null;
};

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { convertPrice } = useCurrency();
  const { session } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const [listing, setListing] = useState<Listing | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range>({ start: null, end: null });

  const [guests, setGuests] = useState(1);

  const isFavorited = id ? isInWishlist(id) : false;

  const handleFavoriteToggle = () => {
    if (!session) {
      toast.error("Please sign in to save to your wishlist.");
      navigate('/login');
      return;
    }
    if (!id) return;
    if (isFavorited) {
      removeFromWishlist(id);
    } else {
      addToWishlist(id);
    }
  };

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
          .select('booking_date, check_out_date')
          .eq('listing_id', id);
        
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

        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*, profile:profiles(full_name)')
          .eq('listing_id', id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (reviewData) {
          setReviews(reviewData as ReviewWithProfile[]);
        }
      }
      
      setLoading(false);
      setSelectedDate(null);
      setSelectedRange({ start: null, end: null });
    };

    fetchListingData();
  }, [id]);
  
  const isStay = listing?.category === 'stay';
  const numberOfNights = isStay && selectedRange.start && selectedRange.end 
    ? differenceInCalendarDays(parseISO(selectedRange.end), parseISO(selectedRange.start))
    : 1;
  const totalPrice = isStay 
    ? listing?.price * Math.max(1, numberOfNights) * guests 
    : listing?.price * guests;

  const isBookingDisabled = isStay ? !(selectedRange.start && selectedRange.end) : !selectedDate;

  const handleBooking = () => {
    if (!isBookingDisabled) {
      navigate('/booking', { state: { listing, selectedDate, selectedRange, guests } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
        <Link to="/" className="text-primary hover:brightness-90">Return to home</Link>
      </div>
    );
  }

  const images = listing.images || ['https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800'];
  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            to={`/${listing.category === 'tour' ? 'tours' : listing.category === 'stay' ? 'stays' : 'volunteers'}`}
            className="inline-flex items-center text-gray-600 hover:text-primary"
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
                <div className="absolute top-4 left-4"><span className="bg-primary text-white px-4 py-2 rounded-full text-sm font-medium capitalize">{listing.category}</span></div>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button onClick={handleFavoriteToggle} className="bg-white/80 hover:bg-white rounded-full p-2 transition-colors">
                    <Heart className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`} />
                  </button>
                  <button className="bg-white/80 hover:bg-white rounded-full p-2"><Share2 className="h-5 w-5 text-gray-700" /></button>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4"><div className="flex space-x-2 overflow-x-auto">
                  {images.map((img, i) => <button key={i} onClick={() => setCurrentImageIndex(i)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${i === currentImageIndex ? 'border-primary' : 'border-gray-200'}`}><img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" /></button>)}
                </div></div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center text-gray-600 mb-4"><MapPin className="h-5 w-5 mr-2" /><span>{listing.location}</span></div>
                  {listing.average_rating && listing.average_rating > 0 ? (
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                      <span className="font-semibold text-gray-900">{listing.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-2">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No reviews yet</div>
                  )}
                </div>
                <div className="text-left sm:text-right flex-shrink-0"><div className="text-3xl font-bold text-primary">{convertPrice(listing.price)}</div><div className="text-sm text-gray-500">{listing.category === 'stay' ? 'per night' : 'per person'}</div></div>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">{listing.description}</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 p-6 bg-gray-50 rounded-xl">
                <div className="flex items-center"><Clock className="h-5 w-5 text-primary mr-2" /><div><div className="font-medium">Duration</div><div className="text-sm text-gray-600">{listing.category === 'tour' ? '3-5 Days' : listing.category === 'volunteer' ? '2-4 Weeks' : 'Flexible'}</div></div></div>
                <div className="flex items-center"><Users className="h-5 w-5 text-primary mr-2" /><div><div className="font-medium">Group Size</div><div className="text-sm text-gray-600">{listing.category === 'stay' ? '1-4 Guests' : '2-12 People'}</div></div></div>
                <div className="flex items-center"><Shield className="h-5 w-5 text-primary mr-2" /><div><div className="font-medium">Booking</div><div className="text-sm text-gray-600">Pay on Arrival</div></div></div>
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
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">There are no reviews for this listing yet.</p>
                  <p className="text-sm text-gray-500 mt-2">Be the first to leave a review after you book!</p>
                </div>
              )}
            </motion.div>

          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1">
            <div className="sticky top-28"><div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6"><div className="text-3xl font-bold text-primary">{convertPrice(listing.price)}</div><div className="text-sm text-gray-500">{listing.category === 'stay' ? 'per night' : 'per person'}</div></div>
              <div className="space-y-4">
                {isStay ? (
                  <div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-center p-2 border rounded-lg">
                        <label className="text-xs text-gray-500">CHECK-IN</label>
                        <p className="font-semibold">{selectedRange.start ? format(parseISO(selectedRange.start), 'dd MMM') : 'Select date'}</p>
                      </div>
                      <div className="text-center p-2 border rounded-lg">
                        <label className="text-xs text-gray-500">CHECK-OUT</label>
                        <p className="font-semibold">{selectedRange.end ? format(parseISO(selectedRange.end), 'dd MMM') : 'Select date'}</p>
                      </div>
                    </div>
                    <AvailabilityCalendar mode="range" availableDates={listing.availability as string[] | undefined} bookedDates={bookedDates} selectedRange={selectedRange} onRangeSelect={setSelectedRange} selectedDate={null} onDateSelect={()=>{}} />
                  </div>
                ) : (
                  <div><label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label><AvailabilityCalendar mode="single" availableDates={listing.availability as string[] | undefined} bookedDates={bookedDates} selectedDate={selectedDate} onDateSelect={setSelectedDate} selectedRange={{start: null, end: null}} onRangeSelect={()=>{}} /></div>
                )}
                <div><label className="block text-sm font-medium text-gray-700 mb-2">{isStay ? 'Guests' : 'Travellers'}</label><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">{[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? (isStay ? 'Guest' : 'Traveller') : (isStay ? 'Guests' : 'Travellers')}</option>)}</select></div>
                <div className="border-t pt-4">
                  {isStay && selectedRange.start && selectedRange.end ? (
                    <>
                      <div className="flex justify-between items-center mb-2 text-gray-600"><span>{convertPrice(listing.price)} x {numberOfNights} nights</span><span>{convertPrice(listing.price * numberOfNights)}</span></div>
                      <div className="flex justify-between items-center mb-2 text-gray-600"><span>Guests</span><span>{guests}</span></div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center mb-2 text-gray-600"><span>{convertPrice(listing.price)} x {guests} {isStay ? 'night' : 'person'}</span><span>{convertPrice(listing.price * guests)}</span></div>
                  )}
                  <div className="flex justify-between items-center font-bold text-lg"><span>Total</span><span className="text-primary">{convertPrice(totalPrice || 0)}</span></div>
                </div>
                <button onClick={handleBooking} disabled={isBookingDisabled} className={`w-full text-center bg-primary text-white py-4 rounded-lg text-lg font-semibold hover:brightness-90 ${isBookingDisabled ? 'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : ''}`}>Book Now - Pay on Arrival</button>
                <div className="text-center text-sm text-gray-500">{isBookingDisabled ? 'Please select your dates to book.' : `You won't be charged until arrival.`}</div>
              </div>
            </div></div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
