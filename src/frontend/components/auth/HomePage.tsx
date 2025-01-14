'use client';
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


const HomePage = () => {
  const router = useRouter();

  const teamMembers = [
    { id: 1, name: 'Houdaifa Znagui', seed: 'john'},
    { id: 2, name: 'Yahya Rhiba', avatar: '/api/placeholder/80/80' },
    { id: 3, name: 'Reda Ghouzraf', avatar: '/api/placeholder/80/80' },
    { id: 4, name: 'Kaoutar Mouradi', seed: 'sarah' },
  ];

  return (
    <div className="w-screen bg-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <div className="h-12 w-24 relative">
            <img
              src="/logo_login.svg"
              alt="Pong Logo"
              className="object-contain"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button className="bg-red-700 px-6 py-2 rounded-md hover:bg-red-800 transition" onClick={ ()=>{ router.push('/auth/login')}}>
            Sign in
          </button>
          <button className="bg-red-700 px-6 py-2 rounded-md hover:bg-red-800 transition" onClick={ ()=>{ router.push('/auth/register')}}>
            Register
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="py-16 lg:py-24">
          <p className="text-red-600 text-sm lg:text-base mb-6">ONLINE PONG GAME</p>
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Enjoy your game<br />
            and chat with<br />
            your friends
          </h1>
          <p className="text-gray-400 max-w-lg mb-8">
            Lorem ipsum is simply dummy text of the printing and 
            typesetting industry. Lorem Ipsum has been the industry's 
            standard.
          </p>
          <button className="bg-red-700 px-8 py-3 rounded-md hover:bg-red-800 transition" onClick={ ()=>{ router.push('/auth/login')}}>
            PLAY NOW
          </button>
        </div>

        {/* Team Section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Our Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {teamMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-zinc-900/80 p-6 rounded-lg flex flex-col items-center"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}&backgroundColor=b6e3f4`}
                  alt={`${member.name} avatar`}
                  className="w-16 h-16 rounded-full mb-4"
                />
                <p className="text-gray-400 text-sm">{member.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Game Preview Section */}
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-8">Game Preview</h2>
          <div className="w-full aspect-video bg-zinc-900 rounded-lg"></div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;