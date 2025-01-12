'use client';

import { usePathname } from 'next/navigation';
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.includes('/auth/');

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="logo.ico" />
      </head>
      <body className={inter.className}>
        {!isAuthPage && <Sidebar />}
        {children}
      </body>
    </html>
  );
}

