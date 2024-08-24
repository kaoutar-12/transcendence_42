import Conversations from "@/components/Conversations";
import ChatBox from "@/components/ChatBox";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return <main className="chat">
    <Conversations />
    <ChatBox />
    
  </main>;
};

export default page;
