import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute';

type Props = {}


const Home = (props: Props) => {
  return (
    <ProtectedRoute>
      <div>Home</div>
    </ProtectedRoute> 
  )
}

export default Home
