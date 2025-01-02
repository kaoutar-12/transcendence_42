'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6">Login</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}