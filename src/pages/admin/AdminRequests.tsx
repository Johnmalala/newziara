import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Loader, Mail, Phone, MessageSquare, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

type Request = Tables<'custom_package_requests'>;

const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

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
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
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
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedRequest(request)} className="p-2 text-blue-600 hover:text-blue-800" title="View Details">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Request Details</h3>
                <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-full hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">From</h4>
                  <p className="text-lg font-semibold text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-3 text-gray-400" />
                      <a href={`mailto:${selectedRequest.email}`} className="text-gray-700 hover:text-primary">{selectedRequest.email}</a>
                    </div>
                    {selectedRequest.whatsapp_phone && (
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-gray-700">{selectedRequest.whatsapp_phone} (WhatsApp)</span>
                      </div>
                    )}
                    {selectedRequest.call_phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-3 text-gray-400" />
                        <span className="text-gray-700">{selectedRequest.call_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Message</h4>
                  <p className="mt-2 text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">{selectedRequest.message}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-b-lg flex justify-end">
                <button onClick={() => setSelectedRequest(null)} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminRequests;
