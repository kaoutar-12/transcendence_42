import React from "react";
import "@/styles/chat.css";
import { PiChatSlashBold } from "react-icons/pi";


type Props = {
};

const ChatBox = (props: Props) => {
  return (
    <div className="right">
      <div className="no-chat">
        <PiChatSlashBold className="no-chat-icon"/>
        <div className="no-chat-text">
          <h1>No messages, yet.</h1>
          <h2>No messages in your inbox, yet! Start chatting with people.</h2>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default ChatBox;
