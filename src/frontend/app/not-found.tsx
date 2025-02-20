'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import LandingAnimation from '@/components/LandingAnimation/LandingAnimation';


const NotFoundPage = () => {
  const router = useRouter()
  return (
    <main className="relative min-h-screen w-full bg-white overflow-hidden">
      <div className="absolute inset-0">
        <LandingAnimation test />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          {"It seems you're lost"}
        </h1>
        
        <p className="max-w-lg mx-auto text-lg text-white mb-8">
          {"Don't fret, you're not lost in a mysterious dark web. Use the navigation menu or click on the browser's back button to return to a familiar location."}
        </p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 text-sm text-white bg-white/10 
                     hover:bg-white/20 rounded-lg transition-all duration-300
                     hover:scale-105 focus:outline-none focus:ring-2 
                     focus:ring-white/50 active:bg-white/30"
          >
            ← Go Back
          </button>
          
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-3 text-sm text-white bg-white/10 
                     hover:bg-white/20 rounded-lg transition-all duration-300
                     hover:scale-105 focus:outline-none focus:ring-2 
                     focus:ring-white/50 active:bg-white/30"
          >
            Go Home
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;