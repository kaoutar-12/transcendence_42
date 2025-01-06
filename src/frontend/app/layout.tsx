// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import Sidebar from "@/components/Sidebar";
// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Ping Pong Game",
//   description: "Ping Pong with next-js & Django",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <link rel="icon" type="image/x-icon" href="logo.ico"></link>
//       <body className={inter.className}>
//         <Sidebar />
//         {children}
//       </body>
//     </html>
//   );
// }


///////////////////
'use client';

import { usePathname } from 'next/navigation';
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
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
app/layout.tsx
app/layout.tsx (Server Component)
