'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from './LandingAnimation/LandingAnimation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Verify token on component mount
    const verifyAccess = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/verify-token/', {
        method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('access_token');
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