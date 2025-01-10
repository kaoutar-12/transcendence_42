'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import Image from 'next/image';

interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        router.push('/home');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md mx-4 p-8 md:p-12 bg-black/20 backdrop-blur rounded-xl shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white text-center">
          Welcome Back!
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-lg text-white">
              Email
            </label>
            <input
              type="text"
              placeholder="Enter your email"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-lg text-white">
              Password
            </label>
            <input
              type="password"
              placeholder="**********"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white text-lg font-medium rounded-lg transition-colors duration-200"
          >
            Log in
          </button>
        </form>

        <p className="text-center mt-8 text-white">
          Don&apos;t have an account?{' '}
          <a href="/auth/register" className="text-red-500 hover:text-red-400 font-semibold">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}