import Conversations from "@/components/Conversations";
import EmptyConversation from "@/components/EmptyConversation";
import ChatBox from "@/components/ChatBox";
import React from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

type Props = {};

const page = (props: Props) => {
  return <ChatBox />;
};

export default page;
