"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";

type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

interface WebSocketContextProps {
  socket: WebSocket | null;
  status: "connecting" | "open" | "closed" | "error";
  send: (message: WebSocketMessage) => void;
  unreadCounts: Record<string, number>; // Room ID -> count
  resetUnread: (roomId: string) => void; // Add reset function
  messages: any[]; // Add messages array
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider = ({ children }: WebSocketProviderProps) => {
  const [status, setStatus] = useState<
    "connecting" | "open" | "closed" | "error"
  >("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const pathname = usePathname();

  const resetUnread = (roomId: string) => {
    setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
  };

  useEffect(() => {
    const socketUrl = `ws://localhost:8000/ws/global/`;

    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      setStatus("open");
      console.log("WebSocket connected");
    };

    socketRef.current.onclose = () => {
      setStatus("closed");
      console.log("WebSocket disconnected");
    };

    socketRef.current.onerror = (error) => {
      setStatus("error");
      console.error("WebSocket error:", error);
    };

    socketRef.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "chat") {
          const isCurrentRoom = pathname.includes(parsed.data.room_id);
          setMessages((prev) => [...prev, parsed]);

          if (!isCurrentRoom) {
            setUnreadCounts((prev) => ({
              ...prev,
              [parsed.data.room_id]: (prev[parsed.data.room_id] || 0) + 1,
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [pathname]);

  const send = (message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
    } else {
      console.warn("Cannot send message - WebSocket not open");
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        status,
        send,
        unreadCounts,
        resetUnread,
        messages,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
