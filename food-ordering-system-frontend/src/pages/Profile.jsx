import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Save, UserCircle2, Mail, Lock } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get('/users/me');
        setName(res.data.name || '');
        setEmail(res.data.email || '');
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    try {
      setSaving(true);
      const payload = { name, email };
      if (password.trim()) payload.password = password;

      const res = await api.put('/users/me', payload);
      updateUser(res.data.user);
      setPassword('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 animate-pulse text-gray-500 font-bold">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-red-600 via-orange-500 to-red-600" />
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-50 rounded-xl">
              <UserCircle2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500 font-medium">Update your account information.</p>
            </div>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 text-green-700 font-semibold text-sm border border-green-100">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Name</label>
              <div className="relative">
                <UserCircle2 className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">New Password (optional)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-gray-500">Signed in as {user?.role || 'user'}</p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
