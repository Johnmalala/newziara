import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import PartnerFormModal from '../../components/admin/PartnerFormModal';

type Partner = Tables<'partners'>;

const AdminPartners: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('partners').select('*').order('name');
    if (error) {
      toast.error(error.message);
    } else {
      setPartners(data);
    }
    setLoading(false);
  };

  const handleDelete = async (partnerId: string) => {
    if (window.confirm('Are you sure you want to delete this partner? This cannot be undone.')) {
      const { error } = await supabase.from('partners').delete().eq('id', partnerId);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Partner deleted successfully');
        fetchPartners();
      }
    }
  };

  const openModal = (partner: Partner | null = null) => {
    setCurrentPartner(partner);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentPartner(null);
  };

  const handleSave = async (partnerData: Partial<Partner>) => {
    let error;
    if (currentPartner) {
      // Update
      ({ error } = await supabase.from('partners').update(partnerData).eq('id', currentPartner.id));
    } else {
      // Create
      ({ error } = await supabase.from('partners').insert(partnerData));
    }

    if (error) {
      toast.error(error.message);
      return false; // Indicate failure
    } else {
      toast.success(`Partner ${currentPartner ? 'updated' : 'created'} successfully!`);
      fetchPartners();
      closeModal();
      return true; // Indicate success
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Manage Partners</h1>
        <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:brightness-90">
          <Plus className="h-5 w-5 mr-2" />
          Add Partner
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
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Contact Person</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Commission</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((partner) => (
                <tr key={partner.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {partner.name}
                  </th>
                  <td className="px-6 py-4">{partner.contact_person}</td>
                  <td className="px-6 py-4">{partner.email}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{(partner.commission_rate * 100).toFixed(0)}%</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openModal(partner)} className="p-2 text-blue-600 hover:text-blue-800" title="Edit Partner">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(partner.id)} className="p-2 text-red-600 hover:text-red-800" title="Delete Partner">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <PartnerFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        partner={currentPartner}
      />
    </div>
  );
};

export default AdminPartners;
