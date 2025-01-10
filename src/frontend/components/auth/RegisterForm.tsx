'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
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
        if (typeof data === 'object') {
          const errorMessage = data.username?.[0] || 
                             data.email?.[0] || 
                             data.password?.[0] || 
                             'Registration failed';
          setError(errorMessage);
        } else {
          setError('Registration failed');
        }
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black bg-gradient-to-br from-black to-gray-800 flex justify-center items-center">
      <div className="w-full max-w-md p-12 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">
          Create Account
        </h1>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 text-lg text-white">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full p-3 text-base bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-white/30"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-lg text-white">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 text-base bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-white/30"
              required
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
              className="w-full p-3 text-base bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:border-white/30"
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full p-3 bg-red-600 text-white border-none rounded-lg text-lg cursor-pointer mt-4 transition-colors hover:bg-red-700"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-8 text-white">
          Already have an account?{' '}
          <a 
            href="/auth/login"
            className="text-red-600 no-underline font-bold hover:text-red-500"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}