'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
 const [formData, setFormData] = useState({
   username: '',
   email: '',
   password: ''
 });
 const [error, setError] = useState('');
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError('');
   
   try {
     const res = await fetch('http://localhost:8000/api/register/', {
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
       if (typeof data === 'object') {
         const errorMessage = data.username?.[0] || 
                            data.email?.[0] || 
                            data.password?.[0] || 
                            'Registration failed';
         setError(errorMessage);
       } else {
         setError('Registration failed');
       }
     }
   } catch (error) {
     setError('Network error occurred');
   }
 };

 return (
   <div style={{ 
     minHeight: '100vh',
     width: '100%',
     backgroundColor: '#000000',
     backgroundImage: 'linear-gradient(147deg, #000000 0%, #2c3e50 74%)',
     display: 'flex',
     justifyContent: 'center',
     alignItems: 'center'
   }}>
     <div style={{
       width: '100%',
       maxWidth: '450px',
       padding: '3rem',
       backgroundColor: 'rgba(255, 255, 255, 0.1)',
       backdropFilter: 'blur(10px)',
       borderRadius: '20px',
       boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
     }}>
       <h1 style={{ 
         fontSize: '2.5rem',
         fontWeight: 'bold',
         textAlign: 'center',
         marginBottom: '2rem',
         color: '#ffffff'
       }}>Create Account</h1>

       {error && (
         <div style={{
           backgroundColor: 'rgba(220, 38, 38, 0.1)',
           color: '#ff4444',
           padding: '0.75rem',
           borderRadius: '8px',
           marginBottom: '1rem',
           textAlign: 'center'
         }}>
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} style={{
         display: 'flex',
         flexDirection: 'column',
         gap: '1.5rem'
       }}>
         <div>
           <label style={{
             display: 'block', 
             marginBottom: '0.5rem',
             fontSize: '1.1rem',
             color: '#ffffff'
           }}>Username</label>
           <input
             type="text"
             placeholder="Enter your username"
             onChange={(e) => setFormData({...formData, username: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               fontSize: '1rem',
               backgroundColor: 'rgba(255, 255, 255, 0.1)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               borderRadius: '8px',
               color: '#ffffff',
               outline: 'none'
             }}
             required
           />
         </div>
         <div>
           <label style={{
             display: 'block',
             marginBottom: '0.5rem',
             fontSize: '1.1rem',
             color: '#ffffff'
           }}>Email</label>
           <input
             type="email"
             placeholder="Enter your email"
             onChange={(e) => setFormData({...formData, email: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               fontSize: '1rem',
               backgroundColor: 'rgba(255, 255, 255, 0.1)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               borderRadius: '8px',
               color: '#ffffff',
               outline: 'none'
             }}
             required
           />
         </div>
         <div>
           <label style={{
             display: 'block',
             marginBottom: '0.5rem',
             fontSize: '1.1rem',
             color: '#ffffff'
           }}>Password</label>
           <input
             type="password"
             placeholder="**********"
             onChange={(e) => setFormData({...formData, password: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               fontSize: '1rem',
               backgroundColor: 'rgba(255, 255, 255, 0.1)',
               border: '1px solid rgba(255, 255, 255, 0.2)',
               borderRadius: '8px',
               color: '#ffffff',
               outline: 'none'
             }}
             required
           />
         </div>
         <button 
           type="submit" 
           style={{
             width: '100%',
             padding: '0.75rem',
             backgroundColor: '#dc2626',
             color: 'white',
             border: 'none',
             borderRadius: '8px',
             fontSize: '1.1rem',
             cursor: 'pointer',
             marginTop: '1rem',
             transition: 'background-color 0.3s ease'
           }}
         >
           Sign Up
         </button>
       </form>

       <p style={{
         textAlign: 'center',
         marginTop: '2rem',
         color: '#ffffff'
       }}>
         Already have an account?{' '}
         <a 
           href="/auth/login"
           style={{
             color: '#dc2626',
             textDecoration: 'none',
             fontWeight: 'bold'
           }}
         >
           Sign in
         </a>
       </p>
     </div>
   </div>
 );
}