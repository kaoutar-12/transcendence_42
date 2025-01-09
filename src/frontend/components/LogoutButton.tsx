// components/LogoutButton.tsx
'use client';
import { useState } from 'react';
import { IoLogOut } from "react-icons/io5";
import { useRouter } from 'next/navigation';



export default function LogoutButton() {
 const [isLoading, setIsLoading] = useState(false);
 const router = useRouter();


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
       router.push('/auth/login');

     } else {
       console.error('Logout failed');
       router.push('/auth/login');

     }
   } catch (error) {
     console.error('Logout error:', error);
     router.push('/auth/login');

   } finally {
     setIsLoading(false);
   }
 };

 return (
   <button
   onClick={handleLogout}
   disabled={isLoading}
   style={{
     color: "#bb151f",
     backgroundColor: "transparent",
     border: "none",
   }}
  >
   <IoLogOut className="icon" />
  </button>
 );
}