import React, { useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute';
import api from './api'; 
type Props = {}

useEffect(() => {
  // This will automatically handle token refresh if needed
  const fetchData = async () => {
      try {
          const response = await api.get('/user/');
          setData(response.data);
      } catch (error) {
          console.error('Error:', error);
      }
  };

  fetchData();
}, []);


const Home = (props: Props) => {
  return (
    <ProtectedRoute>
      <div>Home</div>
    </ProtectedRoute> 
  )
}

export default Home

function setData(data: any) {
  throw new Error('Function not implemented.');
}
