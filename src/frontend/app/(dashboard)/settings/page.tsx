'use client';
import React, { useState, useEffect } from 'react';
import api from '@/app/api';

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    nickname: '',
    password: '',
    repeatPassword: ''
  });
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Add form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: any = {
        nickname: userData.nickname
      };

      // Only include password update if both fields are filled
      if (userData.password && userData.repeatPassword) {
        updateData.currentPassword = userData.password;
        updateData.newPassword = userData.repeatPassword;
      }

      const response = await api.put('/update_user/', updateData);

      if (response.status === 200) {
        if (response.data.error)
          throw new Error(response.data.error);

        // Clear password fields after successful update
        setUserData(prev => ({
          ...prev,
          password: '',
          repeatPassword: ''
        }));
        
        setSuccess('Profile updated successfully!');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user');

        if (!(response.status === 200)) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.data;
        setUserData(prevData => ({
          ...data,
          password: '',
          repeatPassword: ''
        }));
      } catch (error) {
        setError('Failed to fetch user data:');
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-white">
      {/* Banner Image */}
      <div className="w-full h-48 overflow-hidden">
        <img
          src="/background.jpeg"
          alt="Profile banner"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-3xl mx-auto px-8">
        {/* Profile Header */}
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-gray-300 -mt-16 overflow-hidden border-4 border-black">
              <img
                src='/prfl.png'
                alt="Profile avatar"
                className="w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{userData.username}</h1>
              <p className="text-gray-400">{userData.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition">
              Edit
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}
          
          <div className="space-y-8 py-8">
            <div>
              <label className="block text-gray-400 mb-2">nickname</label>
              <input
                type="text"
                name="nickname"
                value={userData.nickname}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Current Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">New Password</label>
              <input
                type="password"
                name="repeatPassword"
                value={userData.repeatPassword}
                onChange={handleChange}
                className="w-full bg-white text-black px-4 py-3 rounded"
              />
            </div>

            <div className="flex justify-between pt-4">
              <button className="bg-red-700 px-6 py-2 rounded hover:bg-red-800 transition">
                Delete account
              </button>
              <button 
                className="bg-red-700 px-8 py-2 rounded hover:bg-red-800 transition" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;