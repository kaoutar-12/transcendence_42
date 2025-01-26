"use client";

import React, { useEffect, useState } from "react";
import "@/styles/conversation.css";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import EmptyConversation from "./EmptyConversation";
import { User } from "@/app/chat/[room_id]/page";
import { IoSearch } from "react-icons/io5";

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

  const pathname = usePathname();
  console.log(pathname);

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
      `${process.env.NEXT_PUBLIC_API_URL}/rooms/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
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
                      <div className="name">{conversation.user.username}</div>
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
