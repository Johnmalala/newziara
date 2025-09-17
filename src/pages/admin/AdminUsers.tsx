import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Tables } from '../../types/supabase';
import { format } from 'date-fns';
import { Loader, User, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

type Profile = Tables<'profiles'>;

const AdminUsers: React.FC = () => {
  const { profile: currentAdminProfile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast.error(error.message);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentAdminProfile?.id) {
      toast.error("You cannot change your own role.");
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) {
      return;
    }

    const originalUsers = [...users];
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      )
    );

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update role in profile.');
      setUsers(originalUsers);
    } else {
      toast.success('User role updated successfully in their profile.');
      toast('Remember to update their role in the Supabase Dashboard for full admin access.', {
        icon: '🔔',
        duration: 6000
      });
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Manage Users</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Full Name</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Email</th>
                <th scope="col" className="px-6 py-3 hidden md:table-cell">Joined At</th>
                <th scope="col" className="px-6 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {user.full_name || 'N/A'}
                  </th>
                  <td className="px-6 py-4 hidden sm:table-cell">{user.email}</td>
                  <td className="px-6 py-4 hidden md:table-cell">{format(new Date(user.created_at), 'dd MMM yyyy')}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={user.id === currentAdminProfile?.id}
                      className={`text-xs font-medium border-none rounded-full appearance-none focus:ring-0 p-2 ${getRoleColor(user.role)} disabled:opacity-70 disabled:cursor-not-allowed`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
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

export default AdminUsers;
