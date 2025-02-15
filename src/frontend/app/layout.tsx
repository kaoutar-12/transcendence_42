"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { WebSocketProvider } from "@/components/context/useWebsocket";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authPages = ["/login", "/register", "/", "/call"];
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.ico" />
      </head>
      <body className={inter.className}>
        <ProtectedRoute isAuthPage={isAuthPage}>
          <WebSocketProvider>
            <Sidebar />
            {children}
          </WebSocketProvider>
        </ProtectedRoute>
      </body>
    </html>
  );
}