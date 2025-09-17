import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Save, Loader, Image as ImageIcon, LogOut } from 'lucide-react';
import { TablesUpdate } from '../../types/supabase';
import { useAuth } from '../../context/AuthContext';

type SiteSettingsUpdate = TablesUpdate<'site_settings'>;

const AdminSettings: React.FC = () => {
  const { signOut } = useAuth();
  const [settings, setSettings] = useState<SiteSettingsUpdate>({ id: 1, banner_url: '', primary_color: '#dc2626', auth_background_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  
  const [authBgFile, setAuthBgFile] = useState<File | null>(null);
  const [authBgPreview, setAuthBgPreview] = useState<string | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const authBgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (error) {
        toast.error('Could not fetch site settings.');
      } else if (data) {
        setSettings(data);
        setBannerPreview(data.banner_url || null);
        setAuthBgPreview(data.auth_background_url || null);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'authBg') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'banner') {
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
      } else {
        setAuthBgFile(file);
        setAuthBgPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToUpdate: SiteSettingsUpdate = { 
        primary_color: settings.primary_color 
    };

    try {
      if (bannerFile) {
        const fileName = `banner-${Date.now()}`;
        const { data, error } = await supabase.storage.from('site-assets').upload(fileName, bannerFile, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(data.path);
        dataToUpdate.banner_url = publicUrl;
      }
      
      if (authBgFile) {
        const fileName = `auth-bg-${Date.now()}`;
        const { data, error } = await supabase.storage.from('site-assets').upload(fileName, authBgFile, { upsert: true });
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('site-assets').getPublicUrl(data.path);
        dataToUpdate.auth_background_url = publicUrl;
      }

      const { error: dbError } = await supabase.from('site_settings').update(dataToUpdate).eq('id', 1);
      if (dbError) throw dbError;

      toast.success('Settings saved successfully!');
      // Refetch settings to get the latest state from DB
      const { data: updatedData } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (updatedData) {
        setSettings(updatedData);
        setBannerPreview(updatedData.banner_url || null);
        setAuthBgPreview(updatedData.auth_background_url || null);
        setBannerFile(null);
        setAuthBgFile(null);
      }

    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader className="animate-spin h-8 w-8 text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Site Settings</h1>
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-8">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Home Page Banner</label>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <input type="file" ref={bannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} accept="image/*" className="hidden" />
              <button type="button" onClick={() => bannerInputRef.current?.click()} className="mt-4 text-sm font-medium text-primary hover:text-red-500">
                Change Banner Image
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended dimensions: 1920x1080px</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authentication Page Background</label>
            <div className="mt-2 flex flex-col items-center">
              <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {authBgPreview ? (
                  <img src={authBgPreview} alt="Auth Background Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
              <input type="file" ref={authBgInputRef} onChange={(e) => handleFileChange(e, 'authBg')} accept="image/*" className="hidden" />
              <button type="button" onClick={() => authBgInputRef.current?.click()} className="mt-4 text-sm font-medium text-primary hover:text-red-500">
                Change Auth Image
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Recommended dimensions: 800x1200px</p>
            </div>
          </div>

          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Main Website Color</label>
            <div className="flex items-center space-x-3">
              <input type="color" id="primaryColor" name="primary_color" value={settings.primary_color || '#dc2626'} onChange={(e) => setSettings(prev => ({...prev, primary_color: e.target.value}))} className="p-1 h-10 w-10 block bg-white border border-gray-300 cursor-pointer rounded-lg" />
              <input type="text" value={settings.primary_color || '#dc2626'} onChange={(e) => setSettings(prev => ({...prev, primary_color: e.target.value}))} name="primary_color" className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          
          <div className="flex justify-end border-t dark:border-gray-700 pt-6">
            <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2 rounded-lg flex items-center hover:brightness-90 disabled:opacity-50">
              {saving ? <><Loader className="animate-spin h-5 w-5 mr-2" />Saving...</> : <><Save className="h-5 w-5 mr-2" />Save Settings</>}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Account Actions</h2>
          <button
            onClick={signOut}
            className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg flex items-center justify-center hover:bg-red-700 disabled:opacity-50"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
