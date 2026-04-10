import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Settings, Edit3, ShieldAlert, LogOut } from 'lucide-react';

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!authUser?.id) return;
        setLoading(true);
        const res = await api.get(`/users/${authUser.id}`);
        setProfile(res.data);
        setFormData({ name: res.data.name, email: res.data.email });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authUser]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateSuccess(false);
    setError('');

    try {
      const res = await api.put(`/users/${authUser.id}`, formData);
      setProfile(res.data.user);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Wait until user is fully loaded to prevent flash errors
  if (!authUser) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-red-400" />
        <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
        <p className="text-gray-600">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary-600 text-white rounded-lg font-bold">Try Again</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in-up">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
        {/* Header/Banner Section */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-8 h-32 relative">
          <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
            <User className="w-10 h-10 text-primary-500" />
          </div>
        </div>

        {/* Body Section */}
        <div className="pt-16 px-8 pb-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile?.name}</h1>
              <p className="text-gray-500 font-medium flex items-center mt-1">
                <Mail className="w-4 h-4 mr-2" /> {profile?.email}
              </p>
            </div>
            <div className="flex space-x-3">
              <span className="px-4 py-1.5 bg-primary-50 text-primary-700 font-bold rounded-full text-sm flex items-center">
                Role: <span className="capitalize ml-1">{profile?.role || 'User'}</span>
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex gap-8 text-left justify-between items-end">
             <div>
               <h3 className="text-xl font-bold text-gray-800 flex items-center">
                 <Settings className="w-5 h-5 mr-2 text-primary-500" /> Account Details
               </h3>
               <p className="text-sm text-gray-500 mb-6 mt-1">Manage your personal information and preferences.</p>
             </div>
             {!isEditing && (
                 <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-primary-600 hover:text-primary-800 font-bold px-4 py-2 hover:bg-primary-50 rounded-xl transition"
                 >
                   <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
                 </button>
             )}
          </div>

          {updateSuccess && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl font-medium border border-green-200">
              Your profile has been updated successfully!
            </div>
          )}

          {error && isEditing && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl font-medium border border-red-200">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                <input 
                  required
                  name="name" 
                  type="text" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-medium" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                <input 
                  required
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  className="w-full p-4 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm font-medium" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  disabled={updating}
                  type="submit" 
                  className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ name: profile?.name, email: profile?.email });
                    setError('');
                  }}
                  className="px-8 py-3 bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-xl font-bold transition shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1">Full Name</p>
                <p className="text-lg font-bold text-gray-900">{profile?.name}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1">Email Address</p>
                <p className="text-lg font-bold text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1">Member Since</p>
                <p className="text-lg font-bold text-gray-900">
                   {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
             <button 
                onClick={() => { logout(); navigate('/'); }}
                className="flex flex-1 items-center justify-center p-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl font-bold transition group"
             >
                <LogOut className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Sign Out
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;