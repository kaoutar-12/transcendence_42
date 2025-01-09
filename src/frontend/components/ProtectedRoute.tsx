'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from './LandingAnimation/LandingAnimation';
import api from '@/app/api';


export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // const token = localStorage.getItem('access_token');
    
    // if (!token) {
    //   router.push('/auth/login');
    //   return;
    // }

    // Verify token on component mount
    const verifyAccess = async () => {
      try {
        // const response = await fetch('http://localhost:8000/api/verify-token/', {
        //   method: 'GET',
        //     headers: {
        //       'Authorization': `Bearer ${token}`
        //     }
        //   }); 
        //   // const response = await api.get('/verify-token/');
        
        // if (!response.ok) {
        //   localStorage.removeItem('access_token');
        //   localStorage.removeItem('refresh_token');
        //   router.push('/auth/login');
        // } else {
        //   setIsVerified(true);
        // }
        const response = await api.get('/verify-token/'); 
            // const response = await api.get('/verify-token/');
          
          if (!response) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            router.push('/auth/login');
          } else {
            setIsVerified(true);
          }
      } catch {
        router.push('/auth/login');
      }
    };

    verifyAccess();
  }, [router]);

  if (isVerified) {
    return <>{children}</>;
  }
  else
  {
    return <LandingAnimation />;
 // or loading spinner
  }

}