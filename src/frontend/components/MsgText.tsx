import React from "react";
import "@/styles/pageId.css";

type Props = {
    text: string;
    position: "left" | "right";
    status: "idle" | "sending" | "failed" | "sent";
};

const MsgText = ({text, position, status}: Props) => {
  return (
    <div className={`msg-wrapper msg-wrapper-${position}`}>
      <div className={`msg msg-${position}`}>{text}</div>
    </div>
  );
};

export default MsgText;
