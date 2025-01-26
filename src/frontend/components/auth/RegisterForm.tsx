'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import ParticlesBackground from '@/components/auth/particales';


export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    
    try {
      const res = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (typeof data === 'object') {
          const errorMessage = data.username?.[0] || 
                             data.email?.[0] || 
                             data.password?.[0] || 
                             'Registration failed';
          setError(errorMessage);
          return;}
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        router.push('/home');
      } else {
          setError('Registration failed');
        }
      
    } catch (error) {
      setError('Network error occurred');
    }
    finally
    {    
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      <ParticlesBackground />
    <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo_login.svg"
            alt="Logo"
            width={120}
            height={50}
            priority
            className='cursor-pointer'
            onClick={()=>{router.push('/')}}
          />
        </div>

      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl text-gray-800 text-center mb-8">
          Create Account
        </h1>

        

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="**********"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
              required
            />
          </div>
          {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}
          <button 
            type="submit" 
            className="w-2/4 mx-auto block py-3 px-4 bg-gray-200/80 hover:bg-gray-300/80 text-red-600 font-semibold text-xl rounded-xl border-2 border-red-600 transition-all duration-200"
            disabled={isLoading}
          >
                {isLoading ? 'Loading...' : 'Sign Up'}
          </button>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <a 
            onClick={ ()=>{ router.push('/login')}}
            className="text-red-500 hover:text-red-600 cursor-pointer"
            
            >
            Sign in
          </a>
        </p>
        </form>
      </div>
    </div>
    </div>
  );
}