/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import "@/styles/conversation.css";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import EmptyConversation from "./EmptyConversation";
import { User } from "@/app/chat/[room_id]/page";
import { IoSearch } from "react-icons/io5";
import { useWebSocket } from "./context/useWebsocket";

type ConversationProps = {
  last_message: string;
  room_id: string;
  time: string;
  user: User;
};

const Conversation = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [selectConversation, setSelectConversation] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { unreadCounts, resetUnread, messages: wsMessages } = useWebSocket();

  const pathname = usePathname();

  useEffect(() => {
    const roomId = pathname.split("/")[2];
    if (roomId) {
      resetUnread(roomId);
    }
  }, [pathname]);

  useEffect(() => {
    const lastMessage = wsMessages[wsMessages.length - 1];
    if (lastMessage?.type === "chat") {
      setConversations((prev) => {
        // Find the conversation index
        const index = prev.findIndex(
          (conv) => conv.room_id === lastMessage.data.room_id
        );

        if (index === -1) return prev; // Not found, return previous state

        // Create updated conversations array
        const updated = [...prev];
        const updatedConv = {
          ...updated[index],
          last_message: lastMessage.data.content,
          time: lastMessage.data.time.split(".")[0], // Remove milliseconds
        };

        // Update the conversation
        updated[index] = updatedConv;

        // Move to top
        return [updatedConv, ...updated.filter((_, i) => i !== index)];
      });
    }
  }, [wsMessages]);

  const [searchTerm, setSearchTerm] = useState("");

  // Filter conversations based on the search term
  const filteredConversations = conversations.filter((conversation) =>
    conversation.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const conversationId = pathname.split("/")[2];
    setSelectConversation(conversationId);
  }, [pathname]);

  const handleConversationClick = (id: string) => {
    router.push(`/chat/${id}`);
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/`,
      {
        withCredentials: true,
      }
    );
    setConversations(response.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  if (conversations.length === 0) {
    return <EmptyConversation />;
  }

  return (
    <>
      <div className="chat-search">
        <div className="search">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* <IoSearch className="search-icon" /> */}
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {filteredConversations && (
            <div className="conv-wrraper">
              {filteredConversations.map((conversation, i) => {
                const unreadCount = unreadCounts[conversation.room_id] || 0;
                const isSelected = selectConversation === conversation.room_id;

                return (
                  <div
                    className={`conversation ${
                      selectConversation === conversation.room_id
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleConversationClick(conversation.room_id)
                    }
                    key={i}
                  >
                    <div className="image">
                      <Image
                        src={conversation.user.profile_image || "/prfl.png"}
                        alt="avatar"
                        width="50"
                        height="50"
                        style={{ borderRadius: "50%" }}
                      />
                    </div>
                    <div className="main">
                      <div className="name-row">
                        <div className="name">{conversation.user.username}</div>
                        {!isSelected && unreadCount > 0 && (
                          <span className="message-badge">{unreadCount}</span>
                        )}
                      </div>
                      <div className="message">
                        {conversation.last_message.length > 30
                          ? conversation.last_message.slice(0, 30) + "..."
                          : conversation.last_message}
                      </div>
                      {/* <div className="message">{conversation.message}</div> */}
                    </div>
                    <div className="time">{conversation.time}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Conversation;
