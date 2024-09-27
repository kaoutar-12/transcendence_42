'use client';

import React, { use } from "react";
import "@/styles/conversation.css";
import { useRouter } from "next/navigation";

type Props = {};

const Conversation = (props: Props) => {
  const router = useRouter();

  return (
    <div className="conversation" onClick={() => {
      router.push("/chat/1");
    }}>
      <div className="image"></div>
      <div className="main">
        <div className="name">John Doe</div>
        <div className="message">Hello, how are you?</div>
      </div>
      <div className="time">9:51</div>
    </div>
  );
};

export default Conversation;
