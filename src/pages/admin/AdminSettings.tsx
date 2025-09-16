import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Loader } from 'lucide-react';
import { TablesUpdate } from '../../types/supabase';

type SiteSettingsUpdate = TablesUpdate<'site_settings'>;

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettingsUpdate>({ id: 1, banner_url: '', logo_url: '', primary_color: '#dc2626' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (error) {
        toast.error('Could not fetch site settings.');
      } else if (data) {
        setSettings(data);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('site_settings').update({ 
      banner_url: settings.banner_url,
      logo_url: settings.logo_url,
      primary_color: settings.primary_color
    }).eq('id', 1);
    
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
        <Loader className="animate-spin h-8 w-8 text-primary" />
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
              name="banner_url"
              value={settings.banner_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="https://images.unsplash.com/..."
            />
            {settings.banner_url && (
                <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">Banner Preview:</p>
                    <img src={settings.banner_url} alt="Banner Preview" className="w-full h-48 object-cover rounded-lg" />
                </div>
            )}
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Website Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              name="logo_url"
              value={settings.logo_url || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="https://yoursite.com/logo.svg"
            />
            {settings.logo_url && (
                <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-300 mb-2">Logo Preview:</p>
                    <img src={settings.logo_url} alt="Logo Preview" className="h-10" />
                </div>
            )}
          </div>

          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
              Main Website Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id="primaryColor"
                name="primary_color"
                value={settings.primary_color || '#dc2626'}
                onChange={handleChange}
                className="p-1 h-10 w-10 block bg-white border border-gray-300 cursor-pointer rounded-lg"
              />
              <input
                type="text"
                value={settings.primary_color || '#dc2626'}
                onChange={handleChange}
                name="primary_color"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-6 py-2 rounded-lg flex items-center hover:brightness-90 disabled:opacity-50"
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
