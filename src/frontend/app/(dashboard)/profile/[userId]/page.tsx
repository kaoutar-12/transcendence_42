"use client";
import React from "react";
import "@/styles/dashboard.css";
import { useRouter } from "next/navigation";
import { User } from "@/app/chat/[room_id]/page";

import LevelBar from "@/components/ProcessBar";
import MatchHistory from "@/components/HistoryTable";
import api from "@/app/utils/api";
import Image from "next/image";

interface MatchHistoryItem {
  component: string;
  level: number;
  result: string;
  score: string;
  date: string;
}

const sampleMatches: MatchHistoryItem[] = [
  {
    component: "Player",
    level: 2,
    result: "WIN",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
  {
    component: "Player",
    level: 2,
    result: "LOSE",
    score: "5 - 2",
    date: "09/09/2024",
  },
];
export default function Home() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [contacts, setContacts] = React.useState<User[]>([]);
  const [allFriends, setAllFriends] = React.useState<User[]>([]); // Store all friends

  const fetchContacts = async () => {
    try {
      const response = await api.get(`/friends/`, {
        withCredentials: true,
      });
      const friends = response.data.friends;
      setContacts(friends.slice(0, 4)); // First 4 friends
      setAllFriends(friends); // All friends
      console.log("Contacts:", friends);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get("/user/");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  React.useEffect(() => {
    fetchContacts();
  }, []);

  React.useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="home">
      <div className="search">
        <button
          onClick={() => {
            router.push("/search");
          }}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
        >
          Search Players
        </button>
      </div>
      <section>
        <div className="profile-info">
          <div className="avatar">
            <Image
              src={
                user?.profile_image
                  ? `http://backend:8000${user?.profile_image}`
                  : "/prfl.png"
              }
              alt="avatar"
              fill
              style={{ objectFit: "cover", borderRadius: "33px" }}
            />
          </div>
          <div className="info">
            <div className="friends-list">
              <div className="friends">Friends</div>
              <div>{user?.friends.length}</div>
            </div>
            <div className="username">{user?.username}</div>
            <div className="online">
              <span>Online</span>
              <div className="online-col"></div>
            </div>
          </div>
        </div>
        {/* <LevelBar level={4} percentage={30} /> */}
        <div className="buttons">
          <button class="message-button" onclick="handleSendMessageClick()">
            Send Message
          </button>

          <button class="block-button" onclick="handleBlockClick()">
            Block
          </button>

          <button class="invite-button" onclick="handleInviteClick()">
            Invite for Game
          </button>

          <button class="add-friend-button" onclick="handleAddFriendClick()">
            Add Friend
          </button>
        </div>
        <section></section>
        <div className="grid-container">
          <div className="item-1">
            {/* <h1>Friend List</h1>
            <div className="friends-container">
              {allFriends?.map((friend, index) => (
                <div key={index} className="friend-avatar">
                  <div className="img">
                    <Image
                      src={
                        friend?.profile_image
                          ? `http://backend:8000${friend.profile_image}`
                          : "/prfl.png"
                      }
                      alt={`${friend.username}'s avatar`}
                      width={60}
                      height={60}
                      style={{ borderRadius: "50%", objectFit: "cover" }}
                    />
                  </div>
                  <span className="friend-name">{friend.username}</span>
                </div>
              ))}
            </div> */}
          </div>
          <div className="item-2">2</div>
          <div className="item-3">
            <MatchHistory matches={sampleMatches} />
          </div>
        </div>
      </section>
    </div>
  );
}
