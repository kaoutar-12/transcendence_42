'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from '../LandingAnimation/LandingAnimation';
import api from '@/app/api';

let isVerifying = false;

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthPage?: boolean; // New prop to identify auth pages (login/register)
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
      
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      // Handle auth pages (login/register)
      if (isAuthPage) {
        if (accessToken && refreshToken) {
          try {
            const response = await api.get('/verify-token/');
            if (response.status === 200) {
              // If tokens are valid, redirect to home
              router.push('/home');
            } else {
              // If tokens are invalid, clear them but stay on auth page
              localStorage.clear();
              setIsLoading(false);
            }
          } catch (error) {
            localStorage.clear();
            setIsLoading(false);
          }
        } else {
          // No tokens, stay on auth page
          setIsLoading(false);
        }
        return;
      }

      // Handle protected routes
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

    return () => {
      isVerifying = false;
    };
  }, [router, isAuthPage]);

  if (isLoading) {
    return <LandingAnimation />;
  }

  // For auth pages, show children if not verified
  if (isAuthPage) {
    return <>{children}</>;
  }

  // For protected routes, show children only if verified
  if (isVerified) {
    return <>{children}</>;
  }

  return <LandingAnimation />;
}