import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Loader, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AdminAvailabilityCalendar from '../../components/admin/AdminAvailabilityCalendar';
import { formatToKes } from '../../utils/currency';

type Listing = Tables<'listings'>;

const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // State for the availability modal
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState<Listing | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
  
  const handleDelete = async (listingToDelete: Listing) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      if (listingToDelete.images && listingToDelete.images.length > 0) {
        const imageFileNames = listingToDelete.images.map(url => url.substring(url.lastIndexOf('/') + 1));
        await supabase.storage.from('listing-images').remove(imageFileNames);
      }
      await supabase.from('bookings').delete().eq('listing_id', listingToDelete.id);
      const { error } = await supabase.from('listings').delete().eq('id', listingToDelete.id);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Listing deleted successfully');
        fetchListings();
      }
    }
  };

  const openCalendarModal = (listing: Listing) => {
    setCurrentListing(listing);
    setSelectedDates(Array.isArray(listing.availability) ? listing.availability as string[] : []);
    setIsCalendarModalOpen(true);
  };

  const closeCalendarModal = () => {
    setIsCalendarModalOpen(false);
    setCurrentListing(null);
    setSelectedDates([]);
  };

  const handleSaveAvailability = async () => {
    if (!currentListing) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('listings')
      .update({ availability: selectedDates })
      .eq('id', currentListing.id);
    
    setIsSaving(false);
    if (error) {
      toast.error('Failed to update availability.');
    } else {
      toast.success('Availability updated successfully!');
      // Update local state to reflect change instantly
      setListings(prevListings =>
        prevListings.map(l =>
          l.id === currentListing.id ? { ...l, availability: selectedDates } : l
        )
      );
      closeCalendarModal();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Listings</h1>
        <button onClick={() => navigate('/listings/new')} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:brightness-90">
          <Plus className="h-5 w-5 mr-2" />
          Add Listing
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <table className="w-full min-w-max text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Title</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Price (KES)</th>
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
                  <td className="px-6 py-4">{formatToKes(listing.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listing.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{format(new Date(listing.created_at), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openCalendarModal(listing)} className="p-2 text-green-600 hover:text-green-800" title="Edit Availability">
                      <Calendar className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(`/listings/edit/${listing.id}`)} className="p-2 text-blue-600 hover:text-blue-800" title="Edit Listing">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(listing)} className="p-2 text-red-600 hover:text-red-800" title="Delete Listing">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Availability Calendar Modal */}
      <AnimatePresence>
        {isCalendarModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeCalendarModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Edit Availability</h3>
                  <p className="text-sm text-gray-500">{currentListing?.title}</p>
                </div>
                <button onClick={closeCalendarModal} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <AdminAvailabilityCalendar
                  selectedDates={selectedDates}
                  onSelectionChange={setSelectedDates}
                />
              </div>
              <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <button onClick={closeCalendarModal} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvailability}
                  disabled={isSaving}
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:brightness-90 disabled:opacity-50"
                >
                  {isSaving ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Calendar className="h-5 w-5 mr-2" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminListings;
