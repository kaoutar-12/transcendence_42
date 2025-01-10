// 'use client';

// import { useRouter } from 'next/navigation';
// import React, { useState } from 'react';
// import Image from 'next/image';
// import Particles, { initParticlesEngine } from "@tsparticles/react";


// export default function LoginForm() {
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const router = useRouter();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('http://localhost:8000/api/login/', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();
      
//       if (res.ok) {
//         localStorage.setItem('access_token', data.tokens.access);
//         localStorage.setItem('refresh_token', data.tokens.refresh);
//         router.push('/home');
//       } else {
//         setError(data.error || 'Login failed');
//       }
//     } catch (error) {
//       setError('Network error. Please try again.');
//     }
//   };

//   return (
    
//     <div className="min-h-screen w-full bg-black relative overflow-hidden">
//       {/* Geometric Background - You'll need to put background.png in your public folder */}
      
//       <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4">
//         {/* Logo */}
//         <div className="mb-8">
//           <Image
//             src="/logo_login.svg"
//             alt="Logo"
//             width={120}
//             height={50}
//             priority
//           />
//         </div>

//         {/* Login Card */}
//         <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
//           <h1 className="text-2xl text-gray-800 text-center mb-8">
//             Welcome Back !
//           </h1>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 onChange={(e) => setFormData({...formData, email: e.target.value})}
//                 className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
//               />
//             </div>

//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 type="password"
//                 placeholder="••••••••"
//                 onChange={(e) => setFormData({...formData, password: e.target.value})}
//                 className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
//               />
//             </div>

//             {error && (
//               <div className="text-red-500 text-sm text-center">
//                 {error}
//               </div>
//             )}
// 			<button
// 			  type="submit"
// 			  className="w-2/4 mx-auto block py-3 px-4 bg-gray-200/80 hover:bg-gray-300/80 text-red-600 font-semibold text-xl rounded-xl border-2 border-red-600 transition-all duration-200"
// 			>
// 			  Log in
// 			</button>

//             <p className="text-center text-gray-600 text-sm">
//               Don&apos;t have an account?{' '}
//               <a href="/auth/register" className="text-red-500 hover:text-red-600">
//                 Register here
//               </a>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [init, setInit] = useState(false);
  const router = useRouter();

  // Initialize particles
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: "#000"
      }
    },
    fpsLimit: 120,
    particles: {
      color: {
        value: "#ff0000"
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1
      },
      move: {
        enable: true,
        direction: "none",
        outModes: {
          default: "bounce"
        },
        random: false,
        speed: 2,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 80
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 1, max: 3 }
      }
    },
    detectRetina: true
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        router.push('/home');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0"
        />
      )}

      <div className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center p-4">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo_login.svg"
            alt="Logo"
            width={120}
            height={50}
            priority
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
          <h1 className="text-2xl text-gray-800 text-center mb-8">
            Welcome Back!
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 bg-transparent border-b border-gray-300 focus:border-gray-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-2/4 mx-auto block py-3 px-4 bg-gray-200/80 hover:bg-gray-300/80 text-red-600 font-semibold text-xl rounded-xl border-2 border-red-600 transition-all duration-200"
            >
              Log in
            </button>

            <p className="text-center text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <a href="/auth/register" className="text-red-500 hover:text-red-600">
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}