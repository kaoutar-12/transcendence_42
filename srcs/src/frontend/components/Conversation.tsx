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
    {
      createdAt: "2024-09-27T21:04:18.145Z",
      name: "Nathan Schuppe",
      avatar: "https://loremflickr.com/640/480/people",
      message: "Nam mollitia nobis.",
      time: "2056-03-02T09:36:00.272Z",
      id: "11",
    },
    {
      createdAt: "2024-09-27T19:57:34.640Z",
      name: "Lydia Stanton I",
      avatar: "https://loremflickr.com/640/480/people",
      message: "reiciendis ut fugiat",
      time: "2062-02-09T13:16:53.284Z",
      id: "12",
    },
    {
      createdAt: "2024-09-27T10:17:37.673Z",
      name: "Lucia Turner",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Culpa tempore inventore ut eum minus beatae commodi. Architecto ab fuga laborum tempora magni maxime aliquid velit.",
      time: "2072-02-15T17:10:45.816Z",
      id: "13",
    },
    {
      createdAt: "2024-09-28T05:11:32.761Z",
      name: "Lori Champlin",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Quibusdam ipsam perferendis a debitis ipsa distinctio excepturi atque. Eum itaque illo reiciendis aperiam impedit rem. Unde quos amet explicabo repellat pariatur explicabo veritatis optio officiis. Quia quibusdam voluptate quae recusandae.\nDolorum adipisci dolore quidem dolorem laboriosam. Corporis accusamus natus ratione temporibus sequi repellendus eos quae dolorum. Ea voluptate nulla neque adipisci fugit dolor facilis. Harum incidunt molestiae deleniti quo impedit. Totam tempora fuga omnis. Sed reiciendis esse aut quia totam laborum ratione exercitationem nihil.\nDeleniti dolore ipsam debitis quo illum veniam quae esse assumenda. Itaque aperiam dolore recusandae aspernatur voluptate aliquid ea accusantium. Pariatur atque eaque repellat quos ipsam enim voluptatibus pariatur odio. Fugit facere fugiat nihil repudiandae. Vero alias voluptatum occaecati aperiam neque ab hic tenetur. Rem eveniet pariatur.",
      time: "2076-05-28T18:18:13.786Z",
      id: "14",
    },
    {
      createdAt: "2024-09-28T06:36:07.098Z",
      name: "Martha Bauch",
      avatar: "https://loremflickr.com/640/480/people",
      message: "Cum natus impedit voluptate voluptate rem alias.",
      time: "2037-03-09T03:57:45.893Z",
      id: "15",
    },
    {
      createdAt: "2024-09-28T05:32:14.667Z",
      name: "Erma Frami",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Maiores amet error laborum aliquid porro sed molestiae neque. Ea quasi mollitia. Repudiandae ipsam doloribus adipisci modi ducimus. Repellat necessitatibus iure eum explicabo unde id. Natus voluptas quaerat harum. Vitae rem vero suscipit libero sit odit.",
      time: "2031-12-30T16:41:57.700Z",
      id: "16",
    },
    {
      createdAt: "2024-09-27T23:14:51.089Z",
      name: "Muriel Hodkiewicz PhD",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Placeat sint tempora.\nVoluptatem eos magnam laborum.\nExercitationem dolorem molestiae corporis voluptatibus.",
      time: "2014-08-21T04:29:58.236Z",
      id: "17",
    },
    {
      createdAt: "2024-09-27T16:39:46.550Z",
      name: "Katrina Klocko",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Corporis quaerat et similique nesciunt provident quaerat fugiat eos tempore. Exercitationem quis vero error voluptatum veniam provident. Praesentium rem cupiditate tempora. Aliquid cum ipsam occaecati harum aperiam similique eaque. Itaque accusantium quam nulla inventore libero ea. Incidunt labore quis maiores occaecati sit.",
      time: "2042-12-29T13:19:11.677Z",
      id: "18",
    },
    {
      createdAt: "2024-09-28T03:13:55.564Z",
      name: "Stacey Dickinson",
      avatar: "https://loremflickr.com/640/480/people",
      message: "placeat",
      time: "2088-01-04T17:04:31.345Z",
      id: "19",
    },
    {
      createdAt: "2024-09-27T21:45:44.229Z",
      name: "Mabel Rohan",
      avatar: "https://loremflickr.com/640/480/people",
      message: "consequuntur labore reprehenderit",
      time: "2076-03-02T18:55:23.352Z",
      id: "20",
    },
    {
      createdAt: "2024-09-27T16:22:59.947Z",
      name: "Shaun Miller",
      avatar: "https://loremflickr.com/640/480/people",
      message: "quia officia expedita",
      time: "2078-05-03T16:22:45.609Z",
      id: "21",
    },
    {
      createdAt: "2024-09-27T11:21:09.936Z",
      name: "Sabrina Armstrong",
      avatar: "https://loremflickr.com/640/480/people",
      message: "Nostrum minus ipsum nihil id sed.",
      time: "2061-08-12T15:59:47.302Z",
      id: "22",
    },
    {
      createdAt: "2024-09-28T03:11:49.563Z",
      name: "Danny Nicolas",
      avatar: "https://loremflickr.com/640/480/people",
      message: "iste",
      time: "2078-12-27T00:58:12.820Z",
      id: "23",
    },
    {
      createdAt: "2024-09-27T18:05:21.749Z",
      name: "Alicia Bergnaum",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Repellat nisi error est.\nSequi nulla totam.\nRepellendus perferendis nihil fuga deserunt assumenda qui delectus.\nFugiat facilis veritatis debitis sed nobis excepturi at.\nQuos at autem.",
      time: "2042-05-31T11:28:38.350Z",
      id: "24",
    },
    {
      createdAt: "2024-09-28T00:57:31.000Z",
      name: "Dr. Bennie Conroy",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Quos veniam possimus vero officiis est adipisci officiis delectus. Adipisci sed mollitia a ducimus. Repudiandae ducimus non nulla velit atque alias aperiam.",
      time: "2060-06-18T10:32:54.818Z",
      id: "25",
    },
    {
      createdAt: "2024-09-27T15:25:32.892Z",
      name: "Mr. Esther Braun",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Fuga mollitia nostrum consequuntur at voluptatem voluptatibus nostrum.",
      time: "2051-06-26T23:14:18.879Z",
      id: "26",
    },
    {
      createdAt: "2024-09-27T16:44:41.426Z",
      name: "Alfred Huels",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Assumenda totam alias quidem atque.\nQuaerat aspernatur vitae occaecati.\nTenetur optio quaerat.",
      time: "2082-05-15T09:54:49.310Z",
      id: "27",
    },
    {
      createdAt: "2024-09-27T14:31:33.005Z",
      name: "Pat Connelly III",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Saepe sapiente expedita voluptas debitis. Odit quidem quo doloribus eum illo explicabo et natus accusamus. Itaque accusamus numquam nesciunt omnis deserunt voluptate repudiandae enim facere. Tempora deleniti odit fugit. Praesentium ipsa dolorem suscipit natus fuga voluptatibus.",
      time: "2054-04-09T18:47:04.988Z",
      id: "28",
    },
    {
      createdAt: "2024-09-27T18:51:06.502Z",
      name: "Jeannette Hessel Jr.",
      avatar: "https://loremflickr.com/640/480/people",
      message:
        "Incidunt voluptates error nobis ullam soluta vero nihil ullam. Saepe cum amet corrupti eum. Eaque accusantium beatae adipisci suscipit doloremque distinctio.\nExcepturi atque dolor. Tempora iusto accusantium harum ut quidem. Vel odio officiis magnam aperiam tempora accusamus. Quo eveniet minus deserunt. Pariatur consequuntur fugit vero nobis pariatur error doloremque consectetur quaerat. Qui voluptates est molestiae modi.\nArchitecto temporibus itaque alias aperiam assumenda. Asperiores perspiciatis reiciendis atque. Suscipit ex iste nesciunt libero saepe. Commodi ad laudantium in atque porro quaerat minus. Magni consequatur porro quam ipsam hic ab maxime eligendi quibusdam. Alias laboriosam reiciendis atque cum.",
      time: "2079-08-14T20:19:25.460Z",
      id: "29",
    },
    {
      createdAt: "2024-09-28T02:18:21.211Z",
      name: "Wallace Moore",
      avatar: "https://loremflickr.com/640/480/people",
      message: "Debitis cum dolor expedita totam quasi ducimus.",
      time: "2026-11-17T09:09:57.519Z",
      id: "30",
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
