import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Tables, TablesInsert } from '../../types/supabase';
import toast from 'react-hot-toast';
import { Save, Loader, ArrowLeft, UploadCloud, X } from 'lucide-react';
import AdminAvailabilityCalendar from '../../components/admin/AdminAvailabilityCalendar';
import TagInput from '../../components/admin/TagInput';
import { motion } from 'framer-motion';

type ListingInsert = TablesInsert<'listings'>;
type Partner = Tables<'partners'>;

const ListingFormPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<ListingInsert>>({
    title: '', description: '', price: 0, category: 'tour', status: 'draft',
    location: '', images: [], inclusions: [], exclusions: [], availability: [], partner_id: null
  });
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch partners
      const { data: partnersData } = await supabase.from('partners').select('*').order('name');
      setPartners(partnersData || []);

      // Fetch listing if editing
      if (id) {
        const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
        if (error) {
          toast.error('Could not fetch listing data.');
          navigate('/listings');
        } else if (data) {
          setFormData(data);
          setExistingImageUrls(data.images || []);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImageUrls.length + newImageFiles.length + files.length;
      if (totalImages > 10) {
        toast.error('You can upload a maximum of 10 images.');
        return;
      }
      setNewImageFiles(prev => [...prev, ...files]);
    }
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const totalImages = existingImageUrls.length + newImageFiles.length + files.length;
    if (totalImages > 10) {
      toast.error('You can upload a maximum of 10 images.');
      return;
    }
    setNewImageFiles(prev => [...prev, ...files]);
  }, [newImageFiles.length, existingImageUrls.length]);

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls(prev => prev.filter(imageUrl => imageUrl !== url));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) : value }));
  };

  const handleTagChange = (name: 'inclusions' | 'exclusions', value: string[]) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (dates: string[]) => {
    setFormData(prev => ({ ...prev, availability: dates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let uploadedImageUrls: string[] = [];
    if (newImageFiles.length > 0) {
      const uploadPromises = newImageFiles.map(file => {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
        return supabase.storage.from('listing-images').upload(fileName, file);
      });

      const uploadResults = await Promise.all(uploadPromises);
      
      const failedUploads = uploadResults.filter(result => result.error);
      if (failedUploads.length > 0) {
        console.error("Supabase Storage Error:", failedUploads[0].error);
        toast.error(`Failed to upload ${failedUploads.length} image(s). Check console for details.`);
        setSaving(false);
        return;
      }

      uploadedImageUrls = uploadResults.map(result => {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(result.data!.path);
        return data.publicUrl;
      });
    }

    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    const dataToSave: ListingInsert = {
      ...formData,
      partner_id: formData.partner_id || null,
      price: formData.price || 0,
      title: formData.title || 'Untitled',
      images: finalImageUrls,
    };

    let error;
    if (id) {
      ({ error } = await supabase.from('listings').update(dataToSave).eq('id', id));
    } else {
      ({ error } = await supabase.from('listings').insert(dataToSave));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Listing ${id ? 'updated' : 'created'} successfully!`);
      navigate('/listings');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/listings')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2">
          <ArrowLeft className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{id ? 'Edit Listing' : 'Create New Listing'}</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Listing Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={5} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inclusions</label>
                  <TagInput value={formData.inclusions || []} onChange={(tags) => handleTagChange('inclusions', tags)} placeholder="Add inclusion..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exclusions</label>
                  <TagInput value={formData.exclusions || []} onChange={(tags) => handleTagChange('exclusions', tags)} placeholder="Add exclusion..." />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select name="status" value={formData.status || 'draft'} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select name="category" value={formData.category || 'tour'} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    <option value="tour">Tour</option>
                    <option value="stay">Stay</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Partner</label>
                  <select name="partner_id" value={formData.partner_id || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary">
                    <option value="">Direct (No Partner)</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>{partner.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (USD)</label>
                  <input type="number" name="price" value={formData.price || 0} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                  <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Availability</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Click on dates to toggle their availability for this listing.</p>
            <AdminAvailabilityCalendar selectedDates={formData.availability as string[] || []} onSelectionChange={handleAvailabilityChange} />
          </div>
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Images</h2>
            <div 
              onDrop={onDrop} 
              onDragOver={(e) => e.preventDefault()}
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-primary"
            >
              <div className="space-y-1 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-red-500 focus-within:outline-none">
                    <span>Click to upload</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Max 10 images</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {existingImageUrls.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt="Existing" className="h-24 w-full object-cover rounded-md" />
                  <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {newImageFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="Preview" className="h-24 w-full object-cover rounded-md" />
                  <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md sticky bottom-0 dark:border-t dark:border-gray-700">
          <button type="button" onClick={() => navigate('/listings')} className="mr-4 px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg flex items-center hover:brightness-90 disabled:opacity-50">
            {saving ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {saving ? 'Saving...' : 'Save Listing'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ListingFormPage;
