/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import "@/styles/pageId.css";
import { GrSend } from "react-icons/gr";
import { FaGamepad } from "react-icons/fa";
import { ImBlocked } from "react-icons/im";
import { MdPerson } from "react-icons/md";
import MsgText from "@/components/MsgText";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Image from "next/image";
import { stat } from "fs";
import { RiProfileFill } from "react-icons/ri";
import Conversation from "@/components/Conversation";
import { useWebSocket } from "@/components/context/useWebsocket";
import api from "@/app/utils/api";
import { toast } from "react-toastify";

type Message = {
  id: number;
  content: string;
  sender_id: number;
  sender_username: string;
  room_id: string;
  time: string;
  status: "idle" | "sending" | "failed" | "sent";
};

export type User = {
  id: number;
  username: string;
  email: string;
  profile_image: string;
  nickname: string;
  i_blocked_them?: boolean;
  block_status?: boolean;
};

type ChatRoomState = {
  messages: Message[];
  loggedUser: User | null;
  otherUser: User | null;
  messageStatus: string;
  sendError: string;
  isBlocked: boolean;
  isBlockOpen: boolean;
  message: string;
  socket: WebSocket | null;
  isConnected: boolean;
  nextPageUrl: string;
  messagesCount: number;
  block_status: boolean;
};

const Page = () => {
  const params = useParams<{ room_id: string }>();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [state, setState] = useState<ChatRoomState>({
    messages: [],
    loggedUser: null,
    otherUser: null,
    messageStatus: "idle",
    sendError: "",
    isBlocked: false,
    isBlockOpen: false,
    message: "",
    socket: null,
    isConnected: false,
    nextPageUrl: "",
    messagesCount: 0,
    block_status: false,
  });
  const { on, off } = useWebSocket();

  useEffect(() => {
    const handleBlockUpdate = (data: any) => {
      console.log("SCKET DATA ==> ", data);
      setState((prev) => ({
        ...prev,
        block_status: data.block_status,
        otherUser: {
          ...prev.otherUser,
          i_blocked_them: data.i_blocked_them,
        },
      }));
    };

    on("block_update", handleBlockUpdate);

    return () => {
      off("block_update");
    };
  }, [on, off]);

  const blockUser = async (user_id: number, type: string) => {
    try {
      const response = await api.post(
        `/friends/${type}/${user_id}/`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      toast.error("Error blocking user");
    }
  };

  // kanjibo user li mloggi
  const fetchUserData = async () => {
    try {
      const response = await api.get(`/user/`, {
        withCredentials: true,
      });

      setState((prev) => ({
        ...prev,
        loggedUser: response.data,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // kanjibo user lakher
  const fetchOtherUserData = async () => {
    try {
      const response = await api.get(`/chat/rooms/${params.room_id}/`, {
        withCredentials: true,
      });
      console.log("other user data", response.data);

      setState((prev) => ({
        ...prev,
        otherUser: response.data.other_user,
        isBlocked: response.data.other_user.i_blocked_them,
        block_status: response.data.other_user.block_status,
      }));
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // kanjibo messages
  const fetchMessages = async (url: string | null) => {
    if (!url) return;
    try {
      const response = await axios.get(url, {
        withCredentials: true,
      });
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, ...response.data.results],
        nextPageUrl: response.data.next,
        messagesCount: response.data.count,
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // connect socket
  const connectSocket = () => {
    const socket = new WebSocket(
      `ws://localhost:8000/ws/chat/${params.room_id}/`
    );

    socket.onopen = () => {
      console.log("Chat room socket connected");
      setState((prev) => ({
        ...prev,
        socket,
        isConnected: true,
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setState((prev) => ({
        ...prev,
        messages: [message, ...prev.messages],
      }));
      scrollToBottom();
    };

    socket.onclose = () => {
      console.log("Chat room socket disconnected");
      setState((prev) => ({
        ...prev,
        socket: null,
        isConnected: false,
      }));
    };
  };

  // sending message
  const sendMessage = async () => {
    if (!state.message.trim()) return;

    // kancriyiw temp msg
    const tempMessage: Message = {
      id: Date.now(),
      content: state.message,
      sender_id: state.loggedUser!.id,
      sender_username: state.loggedUser!.username,
      room_id: params.room_id,
      time: new Date().toISOString(),
      status: "sending",
    };

    //TODO: inmpl socket
    try {
      if (state.socket && state.isConnected) {
        state.socket.send(
          JSON.stringify({
            message: state.message,
            sender_id: state.loggedUser!.id,
          })
        );

        setState((prev) => ({
          ...prev,
          message: "",
        }));
      } else {
        setState((prev) => ({
          ...prev,
          messages: [tempMessage, ...prev.messages],
          message: "",
        }));
        const response = await api.post(
          `/chat/messages/`,
          {
            content: state.message,
            room_id: params.room_id,
          },
          {
            withCredentials: true,
          }
        );

        setState((prev) => ({
          ...prev,
          messages: prev.messages.map((msg) =>
            msg.id === tempMessage.id
              ? { ...msg, status: "sent", id: response.data.id }
              : msg
          ),
        }));
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setState((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "failed" } : msg
        ),
      }));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchUserData();
    fetchOtherUserData();
    fetchMessages(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/messages/?room_id=${params.room_id}`
    );
    connectSocket();

    const conversations = document.querySelector("div .left");
    const sidebar = document.querySelector(".sidebar");
    conversations?.classList.add("isOpen");
    sidebar?.classList.add("isOpen");

    scrollToBottom();

    return () => {
      conversations?.classList.remove("isOpen");
      sidebar?.classList.remove("isOpen");
    };
  }, [params.room_id]);

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const openBlockMenu = () => {
    setState((prev) => ({
      ...prev,
      isBlockOpen: true,
    }));
  };

  const confirmBlock = () => {
    // const type = isBlocked ? "block" : "unblock"
    console.log("STATUS ==> ", state.otherUser?.i_blocked_them);
    blockUser(
      state.otherUser?.id,
      state.otherUser?.i_blocked_them ? "unblock" : "block"
    );

    setState((prev) => ({
      ...prev,
      isBlocked: !prev.otherUser?.i_blocked_them,
      isBlockOpen: false,
    }));
  };

  const cancelBlock = () => {
    setState((prev) => ({
      ...prev,
      isBlockOpen: false,
    }));
  };

  return (
    <>
      <div className="messages-wrraper ">
        <div className="header">
          <div className="info">
            <div className="profile-pic">
              <Image
                src={
                  state.otherUser?.profile_image
                    ? `http://backend:8000/media/${state.otherUser?.profile_image}`
                    : "/prfl.png"
                }
                alt="profile pic"
                fill
                style={{ objectFit: "cover", borderRadius: "50%" }}
              />
            </div>
            <div className="name-online">
              <div className="name-chat">{state.otherUser?.username}</div>
              <div className="online">Online</div>
            </div>
          </div>
          <div className="chat-icons">
            <button>
              <FaGamepad className="chat-icon" />
            </button>

            <button onClick={openBlockMenu}>
              {state.isBlocked ? (
                <MdPerson className="chat-icon" />
              ) : (
                <ImBlocked className="chat-icon" />
              )}
            </button>
          </div>
        </div>
        <div className="mid" id="scrollableDiv">
          <InfiniteScroll
            dataLength={state.messagesCount}
            next={() => fetchMessages(state.nextPageUrl)}
            style={{ display: "flex", flexDirection: "column-reverse" }}
            inverse={true}
            hasMore={!!state.nextPageUrl}
            loader={<h4>Loading...</h4>}
            scrollableTarget="scrollableDiv"
          >
            {state.messages.map((message, id) => (
              <React.Fragment key={id}>
                <MsgText
                  text={message.content}
                  position={
                    message.sender_id === state.loggedUser?.id
                      ? "right"
                      : "left"
                  }
                  status={message.status}
                />
              </React.Fragment>
            ))}
          </InfiniteScroll>
        </div>
        <div ref={messagesEndRef} style={{ height: "1px" }} />
        <form
          className="bottom"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <div className="typing">
            <input
              autoComplete="off"
              type="text"
              placeholder={
                state.block_status
                  ? "You can't send a message! You may be blocked"
                  : "Type a message ..."
              }
              disabled={state.block_status}
              id="msginput"
              value={state.message}
              onChange={(e) =>
                setState((prev) => ({ ...prev, message: e.target.value }))
              }
            />
          </div>
        </form>
      </div>

      {state.isBlockOpen && (
        <div className="burl1">
          <div className="conf1">
            <h1>
              Are you sure you want to block{" "}
              <span className="title">{state.otherUser?.nickname}</span>?
            </h1>
            <div className="buttons1">
              <button
                onClick={() => {
                  confirmBlock();
                }}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  cancelBlock();
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
