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
       setError(data.error || 'Registration failed');
     }
   } catch (error) {
     setError('Network error occurred');
   }
 };

 return (
   <div style={{
     minHeight: '100vh',
     width: '100%',
     backgroundColor: '#ffd1dc',
     display: 'flex',
     justifyContent: 'center',
     alignItems: 'center'
   }}>
     <div style={{
       width: '100%',
       maxWidth: '400px',
       padding: '2rem',
       backgroundColor: 'white',
       borderRadius: '8px',
       boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
     }}>
       <h1 style={{ 
         fontSize: '2rem',
         fontWeight: 'bold',
         textAlign: 'center',
         marginBottom: '1.5rem'
       }}>Create Account</h1>

       {error && (
         <div style={{
           padding: '0.75rem',
           marginBottom: '1rem',
           backgroundColor: '#fee2e2',
           color: '#dc2626',
           borderRadius: '4px'
         }}>
           {error}
         </div>
       )}

       <form onSubmit={handleSubmit} style={{
         display: 'flex',
         flexDirection: 'column',
         gap: '1rem'
       }}>
         <div>
           <input
             type="text"
             placeholder="Username"
             onChange={(e) => setFormData({...formData, username: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               border: '1px solid #e5e7eb',
               borderRadius: '4px',
               fontSize: '1rem'
             }}
             required
           />
         </div>
         <div>
           <input
             type="email"
             placeholder="Email"
             onChange={(e) => setFormData({...formData, email: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               border: '1px solid #e5e7eb',
               borderRadius: '4px',
               fontSize: '1rem'
             }}
             required
           />
         </div>
         <div>
           <input
             type="password"
             placeholder="Password"
             onChange={(e) => setFormData({...formData, password: e.target.value})}
             style={{
               width: '100%',
               padding: '0.75rem',
               border: '1px solid #e5e7eb',
               borderRadius: '4px',
               fontSize: '1rem'
             }}
             required
           />
         </div>
         <button 
           type="submit" 
           style={{
             width: '100%',
             padding: '0.75rem',
             backgroundColor: '#4169e1',
             color: 'white',
             border: 'none',
             borderRadius: '4px',
             fontSize: '1rem',
             cursor: 'pointer',
             marginTop: '0.5rem'
           }}
         >
           Sign Up
         </button>
       </form>

       <p style={{
         textAlign: 'center',
         marginTop: '1.5rem'
       }}>
         Already have an account?{' '}
         <a 
           href="/auth/login"
           style={{
             color: '#4169e1',
             textDecoration: 'none'
           }}
         >
           Sign in
         </a>
       </p>
     </div>
   </div>
 );
}