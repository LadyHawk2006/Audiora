'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { 
    user, 
    isLoading: authLoading, 
    signOut, 
    updatePassword: contextUpdatePassword,
    updateProfile: contextUpdateProfile 
  } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch user data on load
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      setFormData({
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
      });
    }
  }, [user, authLoading, router]);

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      setMessage({ text: 'Updating...', type: '' });

      const updates = {};
      let needsUpdate = false;
      
      // Update email if changed
      if (formData.email !== user.email) {
        updates.email = formData.email;
        needsUpdate = true;
      }
      
      // Update name if changed
      const currentName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      if (formData.name !== currentName) {
        updates.data = { full_name: formData.name };
        needsUpdate = true;
      }

      if (needsUpdate) {
        await contextUpdateProfile(updates);
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      } else {
        setMessage({ text: 'No changes to update', type: 'info' });
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage({ 
        text: error.message || 'Failed to update profile', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    try {
      if (!newPassword) {
        throw new Error('New password is required.');
      }
      
      setMessage({ text: 'Updating password...', type: '' });
      await contextUpdatePassword(newPassword);
      
      setMessage({ 
        text: 'Password updated successfully!', 
        type: 'success' 
      });
      setNewPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      setMessage({ 
        text: error.message || 'Failed to update password', 
        type: 'error' 
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <header className="flex justify-between items-center mt-16 mb-8">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <button 
          onClick={signOut} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
        >
          Sign Out
        </button>
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 
          message.type === 'success' ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        <button 
          onClick={updateProfile} 
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Updating...' : 'Update Profile'}
        </button>

        <div className="pt-6 mt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <button 
            onClick={updatePassword} 
            disabled={isLoading || !newPassword}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}