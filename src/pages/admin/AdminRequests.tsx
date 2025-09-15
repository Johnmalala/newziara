import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables, TablesUpdate } from '../../types/supabase';
import { format } from 'date-fns';
import { Loader, Mail, Phone, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

type Request = Tables<'custom_package_requests'>;
type RequestUpdate = TablesUpdate<'custom_package_requests'>;

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_package_requests')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast.error(error.message);
    } else {
      setRequests(data);
    }
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from('custom_package_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Status updated successfully');
      fetchRequests();
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Custom Package Requests</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-red-600" />
          </div>
        ) : (
          <table className="w-full min-w-max text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Contact Info</th>
                <th scope="col" className="px-6 py-3">Message</th>
                <th scope="col" className="px-6 py-3">Submitted At</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{request.name}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Mail className="h-3 w-3 mr-1" /> {request.email}
                    </div>
                    {request.call_phone && (
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <Phone className="h-3 w-3 mr-1" /> {request.call_phone}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-sm">
                    <p className="line-clamp-3">{request.message}</p>
                  </td>
                  <td className="px-6 py-4">{format(new Date(request.created_at), 'dd MMM yyyy, HH:mm')}</td>
                  <td className="px-6 py-4">
                    <select
                      value={request.status || ''}
                      onChange={(e) => handleStatusChange(request.id, e.target.value)}
                      className={`text-xs font-medium border-none rounded-full appearance-none focus:ring-0 ${getStatusColor(request.status)}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
