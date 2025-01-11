'use client';

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
        <ProtectedRoute>
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
        </ProtectedRoute>
  );
}
