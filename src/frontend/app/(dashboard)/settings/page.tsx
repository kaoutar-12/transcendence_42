'use client';
import React, { useState } from 'react';

const ProfileSettings = () => {
  const [userData, setUserData] = useState({
    nickname: 'test',
    username: 'test',
    password: '',
    repeatPassword: ''
  });

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

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
              <h1 className="text-2xl font-semibold">{userData.nickname}</h1>
              <p className="text-gray-400">{userData.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-red-700 px-4 py-2 rounded hover:bg-red-800 transition">
              Edit
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-8 py-8">
          <div>
            <label className="block text-gray-400 mb-2">Nickname</label>
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
            <button className="bg-red-700 px-8 py-2 rounded hover:bg-red-800 transition">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;