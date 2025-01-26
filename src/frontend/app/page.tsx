import HomePage from "@/components/auth/HomePage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function LoginPage() {
  return (
    <ProtectedRoute isAuthPage>
      <HomePage />
    </ProtectedRoute>
  );
}
