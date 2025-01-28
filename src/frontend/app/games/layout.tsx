import Sidebar from "@/components/Sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Particles from '@/components/LandingAnimation/Particles';

export default function GameLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
        <Particles />
        <Sidebar />
        {children}
    </ProtectedRoute>
  );
}
