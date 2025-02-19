/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import "@/styles/conversation.css";
import "@/styles/pageId.css";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import EmptyConversation from "./EmptyConversation";
import { User } from "@/app/chat/[room_id]/page";
import { IoSearch } from "react-icons/io5";
import { useWebSocket } from "./context/useWebsocket";
import { formatToLocalTime } from "@/app/utils/time";
import { RiDeleteBin6Line } from "react-icons/ri";
import api from "@/app/utils/api";

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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

    const handleDeleteRoom = (data: any) => {
      setConversations((prev) => {
        return prev.filter((conv) => conv.room_id !== data.room_id);
      });
    };

    // Register handler
    on("message_update", handleChatMessage);
    on("room_update", handleRoomCreate);
    on("room_deleted", handleDeleteRoom);

    // Cleanup
    return () => {
      off("message_update");
      off("room_update");
      off("room_deleted");
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

  const deleteRoom = async (id: string) => {
    try {
      const response = await api.delete(`/chat/rooms/?room_id=${id}`, {
        withCredentials: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchConversations = async () => {
    setIsLoading(true);
    await api
      .get(`/chat/rooms/`, {
        withCredentials: true,
      })
      .then((response) => {
        setConversations(response.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
    // console.log("response", response.data);
    // setConversations(response.data);
    // setIsLoading(false);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // if (conversations.length === 0) {
  //   return <EmptyConversation />;
  // }

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
          {conversations.length === 0 ? (
            <>
              <EmptyConversation />
            </>
          ) : (
            <>
              {filteredConversations && (
                <>
                  <div className="conv-wrraper">
                    {filteredConversations.map((conversation, i) => {
                      const unread_count =
                        unreadCounts[conversation.room_id] || 0;
                      const isSelected =
                        selectConversation === conversation.room_id;

                      return (
                        <React.Fragment key={i}>
                          <div
                            className={`conversation ${
                              selectConversation === conversation.room_id
                                ? "selected"
                                : ""
                            }`}
                            onClick={() =>
                              handleConversationClick(conversation.room_id)
                            }
                          >
                            <div className="image">
                              <Image
                                src={
                                  conversation.user.profile_image
                                    ? `http://backend:8000/media/${conversation.user.profile_image}`
                                    : "/prfl.png"
                                }
                                // src={"/prfl.png"}
                                priority
                                alt="avatar"
                                sizes={"70px, 70px"}
                                fill
                                style={{
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
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
                                  ? conversation.last_message.slice(0, 30) +
                                    "..."
                                  : conversation.last_message}
                                {!isSelected && unread_count > 0 && (
                                  <span className="message-badge">
                                    {unread_count}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className="delete"
                              onClick={(e) => {
                                setIsDeleteOpen(true);
                              }}
                            >
                              <RiDeleteBin6Line />
                            </div>
                          </div>
                          {isDeleteOpen && (
                            <div className="burl1">
                              <div className="conf1">
                                <h1>
                                  Are you sure you want to{" "}
                                  <b style={{ color: "#bb151f" }}>delete</b>{" "}
                                  this conversation?
                                </h1>
                                <div className="buttons1">
                                  <button
                                    onClick={() => {
                                      deleteRoom(conversation.room_id);
                                      setIsDeleteOpen(false);
                                      router.push("/chat/");
                                    }}
                                  >
                                    Yes
                                  </button>
                                  <button
                                    onClick={() => {
                                      setIsDeleteOpen(false);
                                    }}
                                  >
                                    No
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default Conversation;
