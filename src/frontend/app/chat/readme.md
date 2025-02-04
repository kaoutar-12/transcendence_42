# WebSocket Context Implementation Guide

## 🌐 Overview

This React context provides WebSocket management for real-time features in Next.js applications. It handles:

- WebSocket connection lifecycle
- Message passing
- Unread message tracking
- Connection status monitoring

## 🛠️ Code Structure Breakdown

```typescript
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

// Type definitions and interface declarations
type WebSocketMessage = string | ArrayBuffer | Blob | ArrayBufferView;

interface WebSocketContextProps {
  socket: WebSocket | null;
  status: "connecting" | "open" | "closed" | "error";
  send: (message: WebSocketMessage) => void;
  unreadCounts: Record<string, number>;
  resetUnread: (roomId: string) => void;
  messages: any[];
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);
```

### Key Components

| Component           | Purpose                                 |
| ------------------- | --------------------------------------- |
| `WebSocketContext`  | React context for WebSocket management  |
| `WebSocketProvider` | Provider component wrapping application |
| `useWebSocket`      | Custom hook for accessing context       |
| `unreadCounts`      | Tracks unread messages per chat room    |
| `status`            | Connection status indicator             |

## 🔌 WebSocket Connection Management

### Connection Setup

```typescript
useEffect(() => {
  const socketUrl = `ws://localhost:8000/ws/global/`;
  socketRef.current = new WebSocket(socketUrl);

  // Event handlers
  socketRef.current.onopen = () => {
    setStatus("open");
    console.log("WebSocket connected");
  };

  // ...other event handlers
}, [pathname]);
```

### Event Handling Table

| Event       | Action                                                |
| ----------- | ----------------------------------------------------- |
| `onopen`    | Updates status to "open"                              |
| `onclose`   | Updates status to "closed"                            |
| `onerror`   | Updates status to "error"                             |
| `onmessage` | Processes incoming messages and updates unread counts |

## 📨 Message Handling System

```typescript
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
```

### Message Flow

1. **Receive Message**
   - WebSocket delivers raw message data
2. **Parse Message**
   - Attempt JSON parsing of message payload
3. **Message Type Check**
   - Filter for chat messages using `parsed.type`
4. **Context Awareness**
   - Check if message belongs to current room using `pathname`
5. **State Updates**
   - Add to message history
   - Increment unread counter if not in current room

## 🎯 Key Features

### 1. Connection Status Tracking

Real-time updates of WebSocket state:

- `connecting`: Initial connection attempt
- `open`: Active connection
- `closed`: Graceful shutdown
- `error`: Connection failure

### 2. Unread Message Management

```typescript
const resetUnread = (roomId: string) => {
  setUnreadCounts((prev) => ({ ...prev, [roomId]: 0 }));
};
```

- Per-room unread counters
- Manual reset capability
- Automatic increment when receiving messages for inactive rooms

### 3. Message Persistence

```typescript
const [messages, setMessages] = useState<any[]>([]);
```

- Stores message history in state
- Enables message replay/display
- Facilitates message synchronization across components

## 🚀 Usage Example

```typescript
function ChatInterface() {
  const { send, messages, unreadCounts, resetUnread } = useWebSocket();
  const [input, setInput] = useState("");

  const handleSend = () => {
    send(
      JSON.stringify({
        type: "chat",
        content: input,
        roomId: "general",
      })
    );
    setInput("");
  };

  return (
    <div>
      <div className="message-list">
        {messages.map((msg, i) => (
          <Message key={i} data={msg} />
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
      <div className="unread">Unread: {unreadCounts["general"] || 0}</div>
    </div>
  );
}
```

## 🔒 Security Considerations

1. **Authentication**
   - Cookies are automatically sent with WebSocket requests
   - Backend should validate JWT from cookies
   ```typescript
   // Cookie handling example
   const authToken = Cookies.get("access_token");
   ```
2. **Message Validation**

   - Always validate incoming messages on both client and server
   - Use TypeScript interfaces for type safety

3. Use in components:
   ```typescript
   const { send, status, unreadCounts } = useWebSocket();
   ```
