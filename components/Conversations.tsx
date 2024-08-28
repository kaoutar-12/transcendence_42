import React from "react";
import "@/styles/chat.css";
import { IoSearch } from "react-icons/io5";

type Props = {};

const Conversations = (props: Props) => {
  return (
    <div className="left">
      <div className="top-conversations">
        <span>Chat</span>
        <div className="chat-search">
          <IoSearch />
          <input type="text" placeholder="Search"/>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
