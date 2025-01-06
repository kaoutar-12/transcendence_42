// components/LogoutButton.tsx
'use client';
import { useState } from 'react';

export default function LogoutButton() {
 const [isLoading, setIsLoading] = useState(false);

 const handleLogout = async () => {
   setIsLoading(true);
   try {
     const refresh_token = localStorage.getItem('refresh_token');
     const access_token = localStorage.getItem('access_token');

     const res = await fetch('http://localhost:8000/api/logout/', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${access_token}`
       },
       body: JSON.stringify({ refresh_token })
     });

     if (res.ok) {
       localStorage.clear();
       window.location.href = '/auth/login';
     } else {
       console.error('Logout failed');
     }
   } catch (error) {
     console.error('Logout error:', error);
   } finally {
     setIsLoading(false);
   }
 };

 return (
   <button
     onClick={handleLogout}
     disabled={isLoading}
     className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
   >
     {isLoading ? 'Logging out...' : 'Logout'}
   </button>
 );
}