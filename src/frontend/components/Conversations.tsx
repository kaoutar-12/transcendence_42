import React from "react";
import "@/styles/chat.css";
import { IoSearch } from "react-icons/io5";
import Conversation from "@/components/Conversation";

type Props = {};

const Conversations = (props: Props) => {
  return (
    <div className="left">
      <div className="top-conversations">
        <div className="chat-text">Chat</div>
      </div>
      <Conversation />
    </div>
  );
};

export default Conversations;
