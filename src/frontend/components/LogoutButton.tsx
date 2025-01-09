// components/LogoutButton.tsx
'use client';
import { useState } from 'react';
import { IoLogOut } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import api from '@/app/api';



export default function LogoutButton() {
 const [isLoading, setIsLoading] = useState(false);
 const router = useRouter();



 const handleLogout = async () => {
   setIsLoading(true);
   try {
    const res = await api.post('/logout/');

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