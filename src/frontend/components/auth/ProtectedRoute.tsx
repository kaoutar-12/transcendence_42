'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from '../LandingAnimation/LandingAnimation';
import api from '@/app/api';

let isVerifying = false;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      // If already verifying, skip
      if (isVerifying) return;
      
      // Check if we have tokens first
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        router.push('/auth/login');
        return;
      }

      try {
        isVerifying = true;
        const response = await api.get('/verify-token/');
        
        if (response.status === 200) {
          setIsVerified(true);
        } else {
          localStorage.clear();
          router.push('/auth/login');
        }
      } catch (error) {
        localStorage.clear();
        router.push('/auth/login');
      } finally {
        isVerifying = false;
        setIsLoading(false);
      }
    };

    verifyAccess();

    // Cleanup function
    return () => {
      isVerifying = false;
    };
  }, [router]);

  // Show loading state while verifying
  if (isLoading) {
    return <LandingAnimation />;
  }

  // Show children only if verified
  if (isVerified) {
    return <>{children}</>;
  }

  // Show loading while redirecting to login
  return <LandingAnimation />;
}