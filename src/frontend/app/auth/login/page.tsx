'use client';
import React, { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      
      if (res.ok) {
        console.log("ha howa dkhal");
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        // localStorage.setItem('user', JSON.stringify(data.user));
        // window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
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
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '0.75rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      <div style={{
        width: '100%',
        maxWidth: '700px',
        padding: '4rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>Welcome Back</h1>
        <p style={{ 
          fontSize: '1.5rem',
          marginBottom: '3rem'
        }}>Please sign in to your account</p>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.2rem'
            }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '1.2rem'
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <input
                type="checkbox"
                onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
              />
              Remember me
            </label>
            <a href="/forgot-password" style={{
              color: 'blue',
              textDecoration: 'underline'
            }}>
              Forgot password?
            </a>
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
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Sign in
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem'
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{
            color: 'blue',
            textDecoration: 'underline'
          }}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}