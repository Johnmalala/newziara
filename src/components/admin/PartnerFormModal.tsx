import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader } from 'lucide-react';
import { Tables } from '../../types/supabase';

type Partner = Tables<'partners'>;

interface PartnerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partnerData: Partial<Partner>) => Promise<boolean>;
  partner: Partner | null;
}

const PartnerFormModal: React.FC<PartnerFormModalProps> = ({ isOpen, onClose, onSave, partner }) => {
  const [formData, setFormData] = useState<Partial<Partner>>({});
  const [commissionInput, setCommissionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData(partner);
      setCommissionInput((partner.commission_rate * 100).toString());
    } else {
      setFormData({ name: '', contact_person: '', email: '', phone: '', commission_rate: 0 });
      setCommissionInput('');
    }
  }, [partner, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCommissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommissionInput(e.target.value);
    const rate = parseFloat(e.target.value);
    if (!isNaN(rate)) {
      setFormData(prev => ({ ...prev, commission_rate: rate / 100 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSave(formData);
    setIsSaving(false);
    if (success) {
      onClose();
    }
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
            className="bg-white rounded-lg shadow-xl w-full max-w-lg"
          >
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{partner ? 'Edit Partner' : 'Add New Partner'}</h3>
                <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Partner Name *</label>
                  <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                    <input type="text" name="contact_person" value={formData.contact_person || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Commission Rate (%) *</label>
                    <input type="number" step="0.1" min="0" max="100" value={commissionInput} onChange={handleCommissionChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" required placeholder="e.g., 15" />
                  </div>
                </div>
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
                  {isSaving ? 'Saving...' : 'Save Partner'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PartnerFormModal;
