import Register from '@/components/auth/RegisterForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function LoginPage() {
  return (
    <ProtectedRoute isAuthPage>
      <Register />
    </ProtectedRoute>
  )
}