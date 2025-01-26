import Sidebar from "@/components/Sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function GameLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
        {/* <Sidebar /> */}
        {children}
    </ProtectedRoute>
  );
}
