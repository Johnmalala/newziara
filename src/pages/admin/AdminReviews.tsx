import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Loader, Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type ReviewWithDetails = Tables<'reviews'> & {
  listing: { title: string } | null;
  profile: { full_name: string } | null;
};

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('*, listing:listings(title), profile:profiles(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setReviews(data as ReviewWithDetails[]);
    }
    setLoading(false);
  };

  const handleStatusChange = async (reviewId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const { error } = await supabase
      .from('reviews')
      .update({ status: newStatus })
      .eq('id', reviewId);

    if (error) {
      toast.error('Failed to update status.');
    } else {
      toast.success(`Review ${newStatus}.`);
      fetchReviews();
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review permanently?')) {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Review deleted successfully.');
        fetchReviews();
      }
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Reviews</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Listing</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">User</th>
                <th scope="col" className="px-6 py-3">Rating</th>
                <th scope="col" className="px-6 py-3">Comment</th>
                <th scope="col" className="px-6 py-3 hidden md:table-cell">Submitted</th>
                <th scope="col" className="px-6 py-3 text-center">Status</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {review.listing?.title || 'N/A'}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    {review.profile?.full_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {renderStars(review.rating)}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="line-clamp-2">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {format(new Date(review.created_at), 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-1">
                      <button
                        onClick={() => handleStatusChange(review.id, review.status)}
                        className={`p-2 rounded-full ${review.status === 'approved' ? 'text-yellow-600 hover:bg-yellow-100' : 'text-green-600 hover:bg-green-100'}`}
                        title={review.status === 'approved' ? 'Unapprove' : 'Approve'}
                      >
                        {review.status === 'approved' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                        title="Delete Review"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

export default AdminReviews;
