import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Loader, User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

type BookingWithDetails = {
  id: string;
  created_at: string;
  booking_date: string;
  total_amount: number;
  payment_status: string | null;
  listing: {
    title: string;
  } | null;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
};

const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, listing:listings(title), profile:profiles(full_name, email)')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast.error(error.message);
    } else {
      setBookings(data as any);
    }
    setLoading(false);
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
                <th scope="col" className="px-6 py-3">Booking Date</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Requested At</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {booking.listing?.title || 'N/A'}
                  </th>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div>{booking.profile?.full_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{booking.profile?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">${booking.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm')}</td>
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
