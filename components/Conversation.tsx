"use client";

import React, { useEffect, useState } from "react";
import "@/styles/conversation.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ConversationProps = {
  avatar: string;
  name: string;
  message: string;
  time: string;
  id: string;
  createdAt: string;
};

const Conversation = () => {
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  const mockdata: ConversationProps[] = [
    {
      createdAt: "2024-09-27T11:42:30.467Z",
      name: "Santos Schultz",
      avatar: "https://loremflickr.com/640/480/people",
      message: "porro",
      time: "1996-02-12T22:50:47.704Z",
      id: "1",
    },
    {
      createdAt: "2024-09-26T21:02:43.042Z",
      name: "Javier Muller",
      avatar: "https://loremflickr.com/640/480/people",
      message: "Recusandae reprehenderit hic.",
      time: "2074-03-03T22:55:21.631Z",
      id: "2",
    },
    {
      createdAt: "2024-09-27T13:49:51.824Z",
      name: "Marvin Douglas",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Minus dicta vel. Blanditiis commodi eaque voluptatum sequi quod illo harum occaecati sit. Quod eaque explicabo asperiores et. Ducimus est ratione autem. Expedita non ullam. Odit nulla aliquam ullam harum in error.",
      time: "2089-06-20T03:00:47.309Z",
      id: "3",
    },
    {
      createdAt: "2024-09-27T00:20:59.147Z",
      name: "Gerardo Kassulke V",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Aliquam aliquam ipsa. Assumenda eos commodi quam. Dolores fugiat ratione error occaecati voluptatibus odit ducimus. Eius impedit recusandae deleniti perferendis cumque iste.\nCommodi nemo facilis saepe omnis consectetur modi. Accusamus quae voluptas hic iure. Distinctio veritatis optio fuga.\nVeritatis est dolore incidunt sequi nulla illo. Consectetur vitae consequuntur suscipit sed autem. Quod numquam eligendi similique eius deleniti. Sapiente eum incidunt repellat molestias unde rerum quod pariatur necessitatibus. Hic unde maiores quis laboriosam placeat saepe facere nisi natus.",
      time: "2016-05-10T03:21:05.018Z",
      id: "4",
    },
    {
      createdAt: "2024-09-27T06:54:16.340Z",
      name: "Freda Emmerich",
      avatar: "https://loremflickr.com/640/480/people",
      message: "molestiae",
      time: "2016-06-02T09:52:34.145Z",
      id: "5",
    },
    {
      createdAt: "2024-09-26T17:12:13.014Z",
      name: "Nelson Rippin",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Adipisci accusantium error cupiditate illum suscipit.\nVero similique nostrum repellat perspiciatis consectetur.\nDoloribus doloribus veniam dolorum alias veniam.",
      time: "2082-07-22T18:32:51.277Z",
      id: "6",
    },
    {
      createdAt: "2024-09-27T06:34:02.996Z",
      name: "Mabel Hessel",
      avatar: "https://loremflickr.com/640/480/people",
      message: "dignissimos",
      time: "2097-05-08T02:07:09.790Z",
      id: "7",
    },
    {
      createdAt: "2024-09-27T04:28:11.153Z",
      name: "Boyd Conroy",
      avatar: "https://loremflickr.com/640/480/people",
      message: "dolores inventore minus",
      time: "2024-09-20T13:53:29.917Z",
      id: "8",
    },
    {
      createdAt: "2024-09-26T19:26:12.925Z",
      name: "Leon Pacocha",
      avatar: "https://loremflickr.com/640/480/people",
      message: "At pariatur eos corrupti.",
      time: "1991-05-27T18:56:20.904Z",
      id: "9",
    },
    {
      createdAt: "2024-09-26T19:40:09.786Z",
      name: "Karl Murphy",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Nemo vel dignissimos non praesentium. Optio voluptas fugiat officiis ex consequatur delectus perspiciatis libero. Odio qui eveniet voluptates vero. Doloribus cumque nesciunt animi laborum corrupti. Ex explicabo et a in praesentium quae.",
      time: "2041-09-24T10:40:41.934Z",
      id: "10",
    },
  ];

  useEffect(() => {
    setConversations(mockdata);
  }, []);

  return (
    <div className="conv-wrraper">
      {conversations.map((conversation, i) => {
        return (
          <div
            className="conversation"
            onClick={() => {
              router.push(`/chat/${conversation.id}`);
            }}
            key={i}
          >
            <div className="image">
              <Image
                src={conversation.avatar}
                alt="avatar"
                width="50"
                height="50"
                style={{ borderRadius: "50%" }}
              />
            </div>
            <div className="main">
              <div className="name">{conversation.name}</div>
              <div className="message">Hello, how are you?</div>
              {/* <div className="message">{conversation.message}</div> */}
            </div>
            <div className="time">{conversation.time}</div>
          </div>
        );
      })}
    </div>
  );
};

export default Conversation;
