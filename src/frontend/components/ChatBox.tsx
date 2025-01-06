import React from "react";
import "@/styles/chat.css";

type Props = {
};

const ChatBox = (props: Props) => {
  return (
    <div className="right">
      <div className="empty">Select a conversation to start chatting</div>
    </div>
  );
};

export default ChatBox;
