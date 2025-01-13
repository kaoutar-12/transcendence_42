import LoginForm from '@/components/auth/LoginForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';


export default function LoginPage() {
  return (
  <ProtectedRoute isAuthPage>
    <LoginForm />
  </ProtectedRoute>
  )
}