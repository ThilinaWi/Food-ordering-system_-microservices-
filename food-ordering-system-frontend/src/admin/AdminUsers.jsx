import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Trash2, Users, Shield, UserCircle } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setError('');
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(`Delete user ${name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-gray-500 font-bold">Loading users...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary-50 rounded-xl">
          <Users className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Users</h1>
          <p className="text-sm text-gray-500 font-medium">View all users and remove accounts if needed.</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm border border-red-100">
          {error}
        </div>
      )}

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Created</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4 text-gray-400" />
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      disabled={deletingId === user.id || user.role === 'admin'}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {deletingId === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="p-10 text-center text-gray-500 font-medium">No users found.</div>}
      </div>
    </div>
  );
};

export default AdminUsers;
