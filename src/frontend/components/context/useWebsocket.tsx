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

type MessageHandler = (data: any) => void;

interface WebSocketContextProps {
  socket: WebSocket | null;
  status: "connecting" | "open" | "closed" | "error";
  send: (message: string) => void;
  on: (type: string, handler: MessageHandler) => void;
  off: (type: string) => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [status, setStatus] =
    useState<WebSocketContextProps["status"]>("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const handlers = useRef<Record<string, MessageHandler>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const pathname = usePathname();

  useEffect(() => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}ws/global/`
    );
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("open");
    };
    socket.onclose = () => {
      setStatus("closed");
    };
    socket.onerror = () => {
      setStatus("error");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handler = handlers.current[message.type];

        if (handler) handler(message.data);
      } catch (error) {}
    };

    return () => socket.close();
  }, [pathname]);

  const send = (message: string) => {
    socketRef.current?.send(message);
  };

  const on = (type: string, handler: MessageHandler) => {
    handlers.current[type] = handler;
  };

  const off = (type: string) => {
    delete handlers.current[type];
  };

  const markAsRead = (roomId: string) => {
    setUnreadCounts((prev) => ({
      ...prev,
      [roomId]: 0,
    }));
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket: socketRef.current,
        status,
        send,
        on,
        off,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context)
    throw new Error("useWebSocket must be used within WebSocketProvider");
  return context;
};
