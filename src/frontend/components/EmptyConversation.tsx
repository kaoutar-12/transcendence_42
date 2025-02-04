import React from 'react';
import "@/styles/chat.css";
import { FaPlus } from "react-icons/fa";



type Props = {}

const EmptyConversation = (props: Props) => {
  const contacts = Array(4).fill(null);

  return (
    <div className="empty">
      <div className="contacts">
        {contacts.map((_, index) => (
          <div key={index} className="contact"></div>
        ))}
        <div className="contact">
          <div className="add-contact">
            <FaPlus />
          </div>
        </div>
      </div>
      <div className="empty-conversation">
        <div className="empty-conversation-text">Select a chat to start messaging</div>
      </div>
    </div>
  );
};

export default EmptyConversation;
