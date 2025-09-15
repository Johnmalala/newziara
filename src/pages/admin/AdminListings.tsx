import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import ListingFormModal from '../../components/admin/ListingFormModal';

type Listing = Tables<'listings'>;

const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error(error.message);
    } else {
      setListings(data);
    }
    setLoading(false);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      // First, delete related bookings
      const { error: bookingError } = await supabase.from('bookings').delete().eq('listing_id', id);
      if (bookingError) {
        toast.error(`Could not delete related bookings: ${bookingError.message}`);
        return;
      }

      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Listing deleted successfully');
        fetchListings();
      }
    }
  };

  const handleAdd = () => {
    setEditingListing(null);
    setIsModalOpen(true);
  };

  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchListings();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
        <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700">
          <Plus className="h-5 w-5 mr-2" />
          Add Listing
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-red-600" />
          </div>
        ) : (
          <table className="w-full min-w-max text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Price</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Created At</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {listing.title}
                  </th>
                  <td className="px-6 py-4 capitalize">{listing.category}</td>
                  <td className="px-6 py-4">${listing.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(listing.created_at), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(listing)} className="p-2 text-blue-600 hover:text-blue-800">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(listing.id)} className="p-2 text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <ListingFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        listing={editingListing}
      />
    </div>
  );
};

export default AdminListings;
