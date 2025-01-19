import React from 'react';


const LandingAnimation = ({test = false} ) => {

  const value = test ? '' : 'loading';

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-r from-black via-red-700 to-red-500 animate-gradient-x">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-48 h-48 rounded-full bg-white opacity-20 animate-ping"></div>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white opacity-20 animate-ping animation-delay-2000"></div>
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-white opacity-20 animate-ping animation-delay-4000"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        
        <h1 className="text-6xl font-bold text-white text-center animate-float">
          {value}
        </h1>
      </div>
    </div>
  );
};

export default LandingAnimation;