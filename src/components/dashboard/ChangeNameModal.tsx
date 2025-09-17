import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface ChangeNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onNameUpdate: (newName: string) => void;
}

const ChangeNameModal: React.FC<ChangeNameModalProps> = ({ isOpen, onClose, currentName, onNameUpdate }) => {
  const { user } = useAuth();
  const [newName, setNewName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newName.trim() === '' || newName.trim() === currentName) {
      onClose();
      return;
    }
    setIsSaving(true);

    const { data: authData, error: authError } = await supabase.auth.updateUser({ data: { full_name: newName.trim() } });

    if (authError) {
      toast.error(authError.message);
      setIsSaving(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').update({ full_name: newName.trim() }).eq('id', user.id);

    if (profileError) {
      toast.error(profileError.message);
      // Attempt to revert auth metadata change if profile update fails
      await supabase.auth.updateUser({ data: { full_name: currentName } });
    } else {
      toast.success('Name updated successfully!');
      onNameUpdate(newName.trim());
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Change Your Name</h3>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-8">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:brightness-90 disabled:opacity-50"
                >
                  {isSaving ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChangeNameModal;
