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
  unreadCounts: Record<string, number>;
  markAsRead: (roomId: string) => void;
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
    const socket = new WebSocket("ws://localhost:8000/ws/global/");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Global socket connected");
      setStatus("open");
    };
    socket.onclose = () => {
      console.log("Global socket disconnected");
      setStatus("closed");
    };
    socket.onerror = () => {
      console.log("Global socket error");
      setStatus("error");
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        const handler = handlers.current[message.type];

        switch (message.type) {
          case "message_update":
            console.log("Current Pathname: ", pathname);
            console.log("Room ID: ", message.data.room_id);
            const isCurrentRoom = pathname.includes(message.data.room_id);
            if (!isCurrentRoom) {
              console.log("Not in the current room, Showing message update");
              setUnreadCounts((prev) => ({
                ...prev,
                [message.data.room_id]: (prev[message.data.room_id] || 0) + 1,
              }));
            } else {
              console.log("In the current room, Not showing message update");
            }
            break;
          case "messages_unread":
            handleReadCount(message.data);
            break;
          case "room_deleted":
            console.log("Room deleted:", message.data.room_id);
            break;
          default:
            console.log("Unknown message type:", message.type);
            break;
        }

        if (handler) handler(message.data);
      } catch (error) {
        console.error("Message handling error:", error);
      }
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

  const handleReadCount = (data: any) => {
    console.log("handleReadCount", data);
    setUnreadCounts((prev) => ({
      ...prev,
      ...data,
    }));
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
        unreadCounts,
        markAsRead,
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
