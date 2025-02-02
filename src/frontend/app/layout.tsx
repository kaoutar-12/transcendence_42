import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { WebSocketProvider } from "@/components/context/useWebsocket";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/logo.ico" />
      </head>
      <body className={inter.className}>
        <WebSocketProvider>
          <Sidebar />
          {children}
        </WebSocketProvider>
      </body>
    </html>
  );
}
