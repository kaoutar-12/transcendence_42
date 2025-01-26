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
	const res = api.post('/logout/');
    router.push('/');
   } catch (error) {
    router.push('/');
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