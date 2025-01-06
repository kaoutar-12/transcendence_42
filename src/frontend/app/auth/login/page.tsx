'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     try {
//       const res = await fetch('http://localhost:8000/api/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       if (res.ok) {
//         const data = await res.json();
//         localStorage.setItem('token', data.access);
//         // router.push('/dashboard');
//         console.log('zbbbb');
//       }
//     } catch (error) {
//       console.error('Login failed:', error);
//     }
//   };  
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
      const res = await fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
          },
          credentials: 'include',
          mode: 'cors', // Add this line
          body: JSON.stringify(formData)
      });
      
      if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.access);
          console.log('Login successful');
          // router.push('/dashboard');
      } else {
          const errorData = await res.json();
          console.error('Login failed:', errorData);
      }
  } catch (error) {
      console.error('Login error:', error);
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, username: e.target.value})}
          />
        </div>
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}