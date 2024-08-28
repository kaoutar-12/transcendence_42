import React from "react";
import '@/styles/chat.css'

type Props = {
  isEmpty?: boolean;
};

const ChatBox = (props: Props) => {
  const userId = 1;

  const messages = [
    {
      id: 1,
      text: "Hello",
      user: {
        id: 1,
        name: "John Doe",
        avatar: "https://randomuser.me/api/portraits",
      },
    },
    {
      id: 2,
      text: "Hi",
      user: {
        id: 2,
        name: "Jane Doe",
        avatar: "https://randomuser.me/api/portraits",
      },
    },
  ];

  return (
    <div className="right">
      {props.isEmpty === true ? (
        <div className="empty">Select a conversation to start chatting</div>
      ) : (
        <>
          {messages.map((message) => (
            <div key={message.id} className="message">
              <img src={message.user.avatar} alt={message.user.name} />
              <div className="">
                <div>{message.user.name}</div>
                <div>{message.text}</div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ChatBox;
