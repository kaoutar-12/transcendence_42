import Sidebar from "@/components/Sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
        <ProtectedRoute>
            <div className="w-full flex  h-screen">
              <div className="flex-none">
              {/* <Sidebar /> */}
              </div>
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
        </ProtectedRoute>
  );
}
