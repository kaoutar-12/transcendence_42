import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/chat.css";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { User } from "@/app/chat/[room_id]/page";
import Image from "next/image";

type Props = {};

const EmptyConversation = (props: Props) => {
  const [contacts, setContacts] = React.useState<User[]>([]);
  const router = useRouter();

  const fetchContacts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/friends/`,
        {
          withCredentials: true,
        }
      );
      setContacts(response.data.friends.slice(0, 4));
      console.log(response.data.friends.slice(0, 4));
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const createConversation = async (id: number) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/`,
        {
          userId: id,
        },
        {
          withCredentials: true,
        }
      );
      console.log("Created Room Response ==> ", response);
      return response.data.room_id;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="empty">
      {contacts.length > 0 ? (
        <>
          <div className="contacts">
            {contacts?.map((contact, index) => (
              <div key={index} className="contact">
                <div className="contact-name">{contact.username}</div>
                <Image
                  src={
                    contact?.profile_image
                      ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${contact.profile_image}`
                      : "/prfl.png"
                  }
                  alt="profile pic"
                  fill
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  onClick={async () => {
                    const id = await createConversation(contact.id);
                    console.log("Created Conv ==> ", id);
                    router.push(`/chat/${id}`);
                  }}
                />
              </div>
            ))}

            {/* <div className="contact">
          <div className="add-contact">
            <FaPlus />
          </div>
        </div> */}
          </div>
          <div className="empty-conversation">
            <div className="empty-conversation-text">
              Select a chat to start messaging
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="no-contacts-message">No friends found</div>
        </>
      )}
    </div>
  );
};

export default EmptyConversation;
