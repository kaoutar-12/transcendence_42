import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/chat.css"; // Ensure this includes the new styles
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { User } from "@/app/chat/[room_id]/page";
import Image from "next/image";
import api from "@/app/utils/api";
import { toast } from "react-toastify";

type Props = {};

const EmptyConversation = (props: Props) => {
  const [contacts, setContacts] = React.useState<User[]>([]);
  const [allFriends, setAllFriends] = React.useState<User[]>([]); // Store all friends
  const [showModal, setShowModal] = React.useState(false); // Toggle modal visibility
  const router = useRouter();

  // Fetch all contacts (friends)
  const fetchContacts = async () => {
    try {
      const response = await api.get(`/friends/`, {
        withCredentials: true,
      });
      const friends = response.data.friends;
      setContacts(friends.slice(0, 4));
      setAllFriends(friends);
    } catch (error) {
      toast.error("Error fetching contacts");
    }
  };

  // Create a conversation with a user
  const createConversation = async (id: number) => {
    try {
      const response = await api.post(
        `/chat/rooms/`,
        {
          userId: id,
        },
        {
          withCredentials: true,
        }
      );
      router.push(`/chat/${response.data.room_id}`);
    } catch (error) {
      toast.error("Error creating conversation");
    }
  };

  // Toggle the modal visibility
  const handleShowModal = () => {
    setShowModal((prev) => !prev);
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
                      ? `${process.env.NEXT_PUBLIC_URL}${contact.profile_image}`
                      : "/prfl.png"
                  }
                  alt="profile pic"
                  fill
                  sizes={"70px, 70px"}
                  style={{ objectFit: "cover", borderRadius: "50%" }}
                  onClick={async () => {
                    await createConversation(contact.id);
                  }}
                />
              </div>
            ))}
            {/* Plus sign to toggle modal */}
            <div className="contact" onClick={handleShowModal}>
              <div className="add-contact">
                <FaPlus />
              </div>
            </div>
          </div>

          {/* Modal for all friends */}
          {showModal && (
            <div className="burl" onClick={handleShowModal}>
              <div
                className="conf"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
              >
                <h1>All Friends</h1>
                <div className="all-friends">
                  {allFriends.map((friend, index) => (
                    <div
                      key={index}
                      className="friend-item"
                      onClick={async () => {
                        await createConversation(friend.id);
                        handleShowModal(); // Close modal after selecting a friend
                      }}
                    >
                      <Image
                        src={
                          friend?.profile_image
                            ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${friend.profile_image}`
                            : "/prfl.png"
                        }
                        alt="profile pic"
                        width={40}
                        height={40}
                        style={{ objectFit: "cover", borderRadius: "50%" }}
                      />
                      <span className="friend-name">{friend.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="empty-conversation">
            <div className="empty-conversation-text">
              Select a chat to start messaging
            </div>
          </div>
        </>
      ) : (
        <div className="no-contacts-message">No friends found</div>
      )}
    </div>
  );
};

export default EmptyConversation;
