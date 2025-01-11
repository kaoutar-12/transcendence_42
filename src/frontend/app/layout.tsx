// 'use client';

// import { Inter } from "next/font/google";
// import "./globals.css";


// const inter = Inter({ subsets: ["latin"] });

// export default function RootLayout({
//   children
// }: {
//   children: React.ReactNode;
// }) {

//   return (
//     <html lang="en">
//       <head>
//         <link rel="icon" type="image/x-icon" href="logo.ico" />
//       </head>
//       <body className={inter.className}>
//         {children}
//       </body>
//     </html>
//   );
// }

import "./globals.css";

export const metadata = {
  title: 'PING PONG',
  description: 'Ping PONG',
  icons: {
    icon: '/logo.webp',
  },
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}