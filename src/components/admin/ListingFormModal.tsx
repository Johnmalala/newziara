import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables, TablesInsert } from '../../types/supabase';
import toast from 'react-hot-toast';
import { Save, Loader, X } from 'lucide-react';

type Listing = Tables<'listings'>;
type ListingInsert = TablesInsert<'listings'>;

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listing: Listing | null;
}

const ListingFormModal: React.FC<ListingFormModalProps> = ({ isOpen, onClose, onSuccess, listing }) => {
  const [formData, setFormData] = useState<Partial<ListingInsert>>({
    title: '',
    description: '',
    price: 0,
    category: 'tour',
    status: 'draft',
    location: '',
    images: [],
    inclusions: [],
    exclusions: [],
    availability: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (listing) {
      setFormData({
        ...listing,
        images: listing.images || [],
        inclusions: listing.inclusions || [],
        exclusions: listing.exclusions || [],
        availability: (listing.availability as string[]) || []
      });
    } else {
      setFormData({
        title: '', description: '', price: 0, category: 'tour', status: 'draft',
        location: '', images: [], inclusions: [], exclusions: [], availability: []
      });
    }
  }, [listing, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };
  
  const handleArrayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.split('\n').filter(item => item.trim() !== '') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToSave: ListingInsert = {
      ...formData,
      price: formData.price || 0,
      title: formData.title || 'Untitled',
    };

    let error;
    if (listing) {
      ({ error } = await supabase.from('listings').update(dataToSave).eq('id', listing.id));
    } else {
      ({ error } = await supabase.from('listings').insert(dataToSave));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Listing ${listing ? 'updated' : 'created'} successfully!`);
      onSuccess();
    }
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{listing ? 'Edit Listing' : 'Create New Listing'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select name="category" value={formData.category || 'tour'} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="tour">Tour</option>
                <option value="stay">Stay</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" value={formData.status || 'draft'} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Price</label>
              <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Images (one URL per line)</label>
            <textarea name="images" value={(formData.images || []).join('\n')} onChange={handleArrayChange} rows={3} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Inclusions (one per line)</label>
              <textarea name="inclusions" value={(formData.inclusions || []).join('\n')} onChange={handleArrayChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Exclusions (one per line)</label>
              <textarea name="exclusions" value={(formData.exclusions || []).join('\n')} onChange={handleArrayChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700">Available Dates (YYYY-MM-DD, one per line)</label>
            <textarea name="availability" value={(formData.availability as string[] || []).join('\n')} onChange={handleArrayChange} rows={4} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
          </div>
        </form>
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 disabled:bg-red-400">
            {saving ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {saving ? 'Saving...' : 'Save Listing'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingFormModal;
