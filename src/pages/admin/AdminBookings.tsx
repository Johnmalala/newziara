import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Loader, User, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatToKes } from '../../utils/currency';
import { Tables } from '../../types/supabase';

type BookingWithDetails = Tables<'bookings'> & {
  listing_title?: string;
  partner_name?: string;
  user_name?: string;
  user_email?: string;
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    // Fetch all data sources in parallel to be more robust than a complex join
    const [bookingsRes, listingsRes, profilesRes, partnersRes] = await Promise.all([
        supabase.from('bookings').select('*').order('created_at', { ascending: false }),
        supabase.from('listings').select('id, title, partner_id'),
        supabase.from('profiles').select('id, full_name, email'),
        supabase.from('partners').select('id, name')
    ]);

    if (bookingsRes.error || listingsRes.error || profilesRes.error || partnersRes.error) {
        toast.error("Failed to fetch all booking details. Please check console for errors.");
        console.error(bookingsRes.error || listingsRes.error || profilesRes.error || partnersRes.error);
        setLoading(false);
        return;
    }

    // Create maps for quick, client-side joining
    const listingsMap = new Map(listingsRes.data.map(l => [l.id, l]));
    const profilesMap = new Map(profilesRes.data.map(p => [p.id, p]));
    const partnersMap = new Map(partnersRes.data.map(p => [p.id, p]));

    // Manually join the data
    const detailedBookings = bookingsRes.data.map(booking => {
        const listing = listingsMap.get(booking.listing_id || '');
        const profile = profilesMap.get(booking.user_id || '');
        const partner = listing ? partnersMap.get(listing.partner_id || '') : undefined;

        return {
            ...booking,
            listing_title: listing?.title || 'N/A',
            user_name: profile?.full_name || 'N/A',
            user_email: profile?.email || 'N/A',
            partner_name: partner?.name || 'Direct',
        };
    });

    setBookings(detailedBookings);
    setLoading(false);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const originalBookings = [...bookings];
    setBookings(prevBookings => 
      prevBookings.map(b => 
        b.id === bookingId ? { ...b, payment_status: newStatus } : b
      )
    );

    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update status.');
      setBookings(originalBookings);
    } else {
      toast.success('Status updated successfully!');
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">All Bookings</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-red-600" />
          </div>
        ) : (
          <table className="w-full min-w-max text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Listing</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Partner</th>
                <th scope="col" className="px-6 py-3">Booking Date</th>
                <th scope="col" className="px-6 py-3">Amount (KES)</th>
                <th scope="col" className="px-6 py-3">Commission (KES)</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {booking.listing_title}
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div>{booking.user_name}</div>
                        <div className="text-xs text-gray-500">{booking.user_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      {booking.partner_name}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{formatToKes(booking.total_amount)}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{booking.commission_owed ? formatToKes(booking.commission_owed) : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <select
                      value={booking.payment_status || 'pending'}
                      onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                      className={`text-xs font-medium border-none rounded-full appearance-none focus:ring-0 p-2 ${getStatusColor(booking.payment_status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="paid">Paid</option>
                      <option value="partial">Partial</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;
