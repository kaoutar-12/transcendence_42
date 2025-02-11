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
import { formatToLocalTime } from "@/app/utils/time";

type ConversationProps = {
  last_message: string;
  room_id: string;
  time: string;
  user: User;
  unread_count: number;
};

const Conversation = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationProps[]>([]);
  const [selectConversation, setSelectConversation] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { on, off, unreadCounts, markAsRead, send } = useWebSocket();

  const pathname = usePathname();

  useEffect(() => {
    const roomId = pathname.split("/")[2];
    if (roomId) {
      markAsRead(roomId);
    }
  }, [pathname]);

  useEffect(() => {
    const handleChatMessage = (data: any) => {
      setConversations((prev) => {
        const index = prev.findIndex((conv) => conv.room_id === data.room_id);
        if (index === -1) return prev;

        const updated = [...prev];
        const updatedConv = {
          ...updated[index],
          last_message: data.content,
          time: data.time.split(".")[0],
        };

        return [updatedConv, ...updated.filter((_, i) => i !== index)];
      });
    };

    const handleRoomCreate = (data: any) => {
      setConversations((prev) => {
        return [data, ...prev];
      });
    };

    // Register handler
    on("message_update", handleChatMessage);
    on("room_update", handleRoomCreate);

    // Cleanup
    return () => {
      off("message_update");
      off("room_update");
    };
  }, [on, off]);

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
    send(JSON.stringify({ type: "mark_read", room_id: id }));
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
    console.log("response", response.data);
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
                const unread_count = unreadCounts[conversation.room_id] || 0;
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
                        src={
                          conversation.user.profile_image
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${conversation.user.profile_image}`
                            : "/prfl.png"
                        }
                        // src={"/prfl.png"}
                        priority
                        alt="avatar"
                        fill
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                    </div>
                    <div className="main">
                      <div className="name-row">
                        <div className="name">
                          <div>{conversation.user.username}</div>
                          <div className="time">
                            {conversation.time &&
                              formatToLocalTime(conversation.time)}
                          </div>
                        </div>
                      </div>
                      <div className="message">
                        {conversation.last_message.length > 30
                          ? conversation.last_message.slice(0, 30) + "..."
                          : conversation.last_message}
                          {!isSelected && unread_count > 0 && (
                            <span className="message-badge">{unread_count}</span>
                          )}
                      </div>
                    </div>
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
