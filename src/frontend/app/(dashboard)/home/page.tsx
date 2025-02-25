/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import "@/styles/dashboard.css";
import { useRouter } from "next/navigation";
import { User } from "@/app/chat/[room_id]/page";

import LevelBar from "@/components/ProcessBar";
import MatchHistory from "@/components/HistoryTable";
import api from "@/app/utils/api";
import Image from "next/image";
import { FaRegMessage } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { CgGames } from "react-icons/cg";
import WinLossCircle from "@/components/WinRateCircle";
import { useWebSocket } from "@/components/context/useWebsocket";
import { toast } from "react-toastify";

export interface MatchHistoryItem {
  game_id: number;
  game_type: string;
  played_at: string;
  player1: string;
  player1_score: number;
  player2: string;
  player2_score: number;
  winner: string;
}

export interface Winrate {
  losses: number;
  winrate: number;
  wins: number;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [contacts, setContacts] = React.useState<User[]>([]);
  const [allFriends, setAllFriends] = React.useState<User[]>([]);
  const [matchHistory, setMatchHistory] = React.useState<MatchHistoryItem[]>(
    []
  );
  const [winRate, setWinRate] = React.useState<Winrate>({
    losses: 0,
    winrate: 0,
    wins: 0,
  });
  const { send } = useWebSocket();

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

  const fetchUser = async () => {
    try {
      const response = await api.get("/user/");
      setUser(response.data);
    } catch (error) {
      toast.error("Error fetching user");
    }
  };

  const fetchMatchHistory = async () => {
    try {
      const response = await api.get(`game/history/${user?.id}/`);
      const winRateResponse = await api.get(
        `game/history/${user?.id}/winrate/`
      );
      setMatchHistory(response.data.matches);
      setWinRate((prev) => ({
        ...prev,
        losses: winRateResponse.data.losses,
        winrate: winRateResponse.data.winrate,
        wins: winRateResponse.data.wins,
      }));
    } catch (error) {
      toast.error("Error fetching match history");
    }
  };

  React.useEffect(() => {
    fetchUser();
    fetchContacts();
  }, []);

  React.useEffect(() => {
    if (user) {
      fetchMatchHistory();
    }
  }, [user]);

  const handleCreateRoom = async (userId: number) => {
    try {
      const response = await api.post(`/chat/rooms/`, {
        userId: userId,
      });
      router.push(`/chat/${response.data.room_id}`);
    } catch (error) {
      toast.error("Error creating room");
    }
  };

  const handleInviteClick = (userId: number) => {
    // TODO: Implement invite functionality
  };

  const handleProfileClick = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className="home">
      <div className="search-dash">
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
          <div className="overflow-hidden">
            <Image
              src="/background.png"
              alt="Profile banner"
              // className="w-full h-full object-cover"
              // width={1920}
              // height={1080}
              priority
              fill
              style={{ objectFit: "cover", borderRadius: "34px" }}
            />
          </div>
          <div className="avatar z-[55]">
            <Image
              src={
                user?.profile_image
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${user?.profile_image}`
                  : "/prfl.png"
              }
              alt="avatar"
              fill
              style={{ objectFit: "cover", borderRadius: "33px" }}
            />
          </div>
          <div className="info-dash z-50">
            <div className="friends-list pl-[25px]">
              <div className="friends">Friends</div>
              <div>{allFriends?.length}</div>
            </div>
            <div className="username-container pr-[120px]">
              <div className="username">{user?.username}</div>
            </div>
          </div>
        </div>
        <div className="grid-container">
          <div className="item-1">
            {allFriends.length > 0 ? (
              <>
                {" "}
                <div className="friends-container">
                  {allFriends?.map((friend, index) => (
                    <div key={index} className="friend-avatar">
                      <div className="flip-card">
                        {/* Front side */}
                        <div className="front">
                          <Image
                            src={
                              friend?.profile_image
                                ? `${process.env.NEXT_PUBLIC_URL}${friend.profile_image}`
                                : "/prfl.png"
                            }
                            alt="avatar"
                            fill
                            sizes="100px, 100px"
                            style={{
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #f00",
                            }}
                          />
                        </div>
                        {/* Back side */}
                        <div className="back">
                          <div className="friend-button">
                            <FaRegMessage
                              style={{
                                color: "blue",
                                width: "20px",
                                height: "20px",
                              }}
                              onClick={() => {
                                handleCreateRoom(friend.id);
                              }}
                            />
                          </div>
                          <div className="friend-button">
                            <CgProfile
                              style={{
                                color: "red",
                                width: "20px",
                                height: "20px",
                              }}
                              onClick={() => {
                                handleProfileClick(friend.username);
                              }}
                            />
                          </div>
                          <div className="friend-button">
                            <CgGames
                              style={{
                                color: "purple",
                                width: "20px",
                                height: "20px",
                              }}
                              onClick={() => {
                                send(
                                  JSON.stringify({
                                    type: "send_invite",
                                    target_user_id: friend.id,
                                  })
                                );
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      <span className="friend-name">{friend.username}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="no-matches">
                  <h2>No Friends Found</h2>
                  <p>Invite friends to see them here!</p>
                </div>
              </>
            )}
          </div>
          <div className="item-2">
            <WinLossCircle
              wins={winRate.wins}
              losses={winRate.losses}
              winRate={winRate.winrate}
            />
          </div>
          <div className="item-3">
            {matchHistory.length > 0 ? (
              <>
                <MatchHistory matches={matchHistory} user={user!} />
              </>
            ) : (
              <>
                <div className="no-matches">
                  <h2>No Matches Found</h2>
                  <p>Start playing to see your match history here!</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
