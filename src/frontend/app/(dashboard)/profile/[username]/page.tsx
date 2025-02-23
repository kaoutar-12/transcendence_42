/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React from "react";
import "@/styles/dashboard.css";
import { useRouter, useParams } from "next/navigation";
import { User } from "@/app/chat/[room_id]/page";
import LevelBar from "@/components/ProcessBar";
import MatchHistory from "@/components/HistoryTable";
import api from "@/app/utils/api";
import Image from "next/image";
// import {  } from "next/navigation";
import { FaRegMessage } from "react-icons/fa6";
import { CgProfile } from "react-icons/cg";
import { CgGames } from "react-icons/cg";
import { toast } from "react-toastify";
import { useWebSocket } from "@/components/context/useWebsocket";
import { MatchHistoryItem, Winrate } from "../../home/page";
import Link from "next/link";
import NotFoundPage from "@/app/not-found";
import WinLossCircle from "@/components/WinRateCircle";

interface Friends {
  id: number;
  username: string;
  nickname: string;
  profile_image: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  nickname: string;
  profile_image: string;
  twoFactorEnabled: boolean;
  is_42: boolean;
  friends: Friends[];
  blocked_users: any[];
  is_friend: boolean;
  is_blocked: boolean;
  is_online: boolean;
}

export default function Home() {
  const params = useParams<{ username: string }>();
  const router = useRouter();
  const [user, setUser] = React.useState<UserData | null>(null);
  const [userOk, setUserOk] = React.useState<boolean>(false);
  const { on, off } = useWebSocket();
  const [matchHistory, setMatchHistory] = React.useState<MatchHistoryItem[]>(
    []
  );
  const [winRate, setWinRate] = React.useState<Winrate>({
    losses: 0,
    winrate: 0,
    wins: 0,
  });
  const { send } = useWebSocket();

  React.useEffect(() => {
    const handleBlockUpdate = (data: any) => {
      console.log("SCKET DATA ==> ", data);
      setUser((prev) =>
        prev !== null ? { ...prev, is_blocked: data.block_status } : prev
      );
    };

    on("block_update", handleBlockUpdate);

    return () => {
      off("block_update");
    };
  }, [on, off]);


  const fetchMatchHistory = async () => {
    try {
      console.log("Fetching match history...");
      const response = await api.get(`game/history/${user?.id}/`);
      const winRateResponse = await api.get(
        `game/history/${user?.id}/winrate/`
      );
      console.log("Match History:", response.data);
      setMatchHistory(response.data.matches);
      console.log("Win Rate:", winRateResponse.data);
      setWinRate((prev) => ({
        ...prev,
        losses: winRateResponse.data.losses,
        winrate: winRateResponse.data.winrate,
        wins: winRateResponse.data.wins,
      }));
    } catch (error) {
      console.error("Error fetching match history:", error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get(`/user/${params.username}/`);

      setUserOk(true);

      if (response.data.error === "can't search your self") {
        router.push('/home');
      }
      else if (response.data.error) {
        setUserOk(false);
        return;
      }

      console.log(response.data);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  React.useEffect(() => {
    fetchUser();
  }, []);

  const handleBlockClick = async (userId: number, block: boolean) => {
    try {
      const response = await api.post(
        `/friends/${block ? "block" : "unblock"}/${userId}/`,
        {}
      );
    } catch (error) {
      toast.error("Error blocking user");
    }
  };

  const handleCreateRoom = async (userId: number) => {
    try {
      const response = await api.post(`/chat/rooms/`, {
        userId: userId,
      });
      router.push(`/chat/${response.data.room_id}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const handleAddfriend = async (userId: number, add: boolean) => {
    try {
      const response = await api.post(
        `/friends/${add ? "add" : "remove"}/${userId}/`
      );
    } catch (error) {
      toast.error("Error adding friend");
    }
  };

  const handleInviteClick = (userId: number) => {
    send(
      JSON.stringify({
        type: "send_invite",
        target_user_id: userId,
      })
    );
  };
  
  React.useEffect(() => {
    if (user) {
      fetchMatchHistory();
    }
  }, [user]);

  if (!userOk) {
    return <NotFoundPage />;
  }

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
          <div className="avatar">
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
          <div className="w-full flex justify-between items-center h-[30%] rounded-[34px] bg-black text-white self-end px-[120px] text-[20px]">
            <div className="flex gap-[40px] items-center justify-center">
              <div className="friends">Friends</div>
              <div>{user?.friends?.length}</div>
            </div>
            <div className="username">{user?.username}</div>
            {user?.is_online && (
              <div className="online">
                <span>Online</span>
                <div className="online-col"></div>
              </div>
            )}
            {!user?.is_online && (
              <div className="online">
                <span>Offline</span>
                <div className="online-col"></div>
              </div>
            )}
          </div>
        </div>
        {/* <LevelBar level={4} percentage={30} /> */}
       
          <div className="buttons">
          <button
            className="message-button"
            onClick={() => handleCreateRoom(user!.id)}
            disabled={user?.is_blocked}
          >
            Send Message
          </button>

          {user?.is_blocked ? (
            <>
              {" "}
              <button
                className="bg-[#bb151f] hover:bg-[#4a4a52]"
                onClick={() => {
                  handleBlockClick(user?.id, false);
                }}
              >
                Unblock
              </button>
            </>
          ) : (
            <>
              <button
                className="block-button"
                onClick={() => {
                  handleBlockClick(user!.id, true);
                }}
              >
                Block
              </button>
            </>
          )}

          <button
            className="invite-button"
            disabled={user?.is_blocked}
            onClick={() => handleInviteClick(user!.id)}
          >
            Invite for Game
          </button>

          {user?.is_friend ? (
            <>
              {" "}
              <button
                className="add-friend-button"
                onClick={() => {
                  handleAddfriend(user.id, false);
                }}
                disabled={user?.is_blocked}
              >
                Remove Friend
              </button>
            </>
          ) : (
            <>
              {" "}
              <button
                className="add-friend-button"
                onClick={() => {
                  handleAddfriend(user!.id, true);
                }}
                disabled={user?.is_blocked}
              >
                Add Friend
              </button>
            </>
          )}
        </div>

        <div className="grid-container">
          <div className="item-1">
            <div className="friends-container">
              {user?.friends?.map((friend, index) => (
                <Link href={`/profile/${friend.username}`} key={index}>
                  <div  className="friend-avatar">
                    <div className="card">
                      {/* Front side */}
                      <div className="front">
                        <Image
                          src={
                            friend?.profile_image
                              ? `${process.env.NEXT_PUBLIC_URL}${friend.profile_image}`
                              : "/prfl.png"
                          }
                          alt="avatar"
                          width={150}
                          height={150}
                          style={{
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "2px solid #f00",
                          }}
                        />
                      </div>
                    </div>
                    <span className="friend-name">{friend.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="item-2">
            <WinLossCircle
              wins={winRate.wins}
              losses={winRate.losses}
              winRate={winRate.winrate}
            /></div>
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
