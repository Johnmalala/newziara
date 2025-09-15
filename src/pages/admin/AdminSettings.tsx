import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Loader } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [bannerUrl, setBannerUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('banner_url').eq('id', 1).single();
      if (error) {
        toast.error('Could not fetch site settings.');
      } else if (data) {
        setBannerUrl(data.banner_url || '');
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({ banner_url: bannerUrl }).eq('id', 1);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Settings saved successfully!');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="animate-spin h-8 w-8 text-red-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Site Settings</h1>
      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label htmlFor="bannerUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Home Page Banner URL
            </label>
            <input
              type="url"
              id="bannerUrl"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="https://images.unsplash.com/..."
            />
            {bannerUrl && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Banner Preview:</p>
                    <img src={bannerUrl} alt="Banner Preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-red-700 disabled:bg-red-400"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
