'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from '../LandingAnimation/LandingAnimation';
import api from '@/app/utils/api';

let isVerifying = false;

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthPage?: boolean; 
}

export default function ProtectedRoute({ 
  children, 
  isAuthPage = false 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      if (isVerifying) return;
      
      if (isAuthPage) {
          try {
            const response = await api.get('/verify-token/');
            if (response.status === 200 ) {
              router.push('/home');
            } else {
              setIsLoading(false);
            }
          } catch (error) {
            setIsLoading(false);
          }
        return;
      }

      try {
        isVerifying = true;
        const response = await api.get('/verify-token/');
        
        if (response.status === 200) {
          setIsVerified(true);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      } finally {
        isVerifying = false;
        setIsLoading(false);
      }
    };

    verifyAccess();

    return () => {
      isVerifying = false;
    };
  }, [router, isAuthPage]);

  if (isLoading) {
    return <LandingAnimation />;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return <LandingAnimation />;
}