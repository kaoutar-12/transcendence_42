"use client";
import React, { useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { Search, UserPlus, MessageSquare, Ban, Gamepad2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/auth/alert";
import api from "@/app/utils/api";
import { useRouter } from "next/navigation";
import { useWebSocket } from "./context/useWebsocket";

// Define interfaces for our data types
interface User {
  id: number;
  username: string;
  email: string;
  is_friend: boolean;
  is_blocked: boolean;
  is_online: boolean;
}

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchQueryTmp, setSearchQueryTmp] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [IsEmpty, setIsEmpty] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const router = useRouter();
  const { send } = useWebSocket();


  useEffect(() => {
    const fetchUserData = async (): Promise<void> => {
      setIsLoading(true);
      setError("");
      setSuccess("");

      try {
        const response = await api.get("/users/search");

        if (response.status === 200) {
          const data: User[] = await response.data.users;
          setUsers(data);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (error) {
        setError(error + "");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  // Fetch users from backend
  const searchUsers = async (query: string): Promise<void> => {
    setIsLoading(true);
    setIsEmpty(false);
    setError("");
    setSuccess("");
    try {
      const response = await api.get(`/users/search?query=${query}`);
      if (!(response.status === 200)) throw new Error("Failed to fetch users");

      const data: User[] = await response.data.users;
      if (!data.length) {
        setIsEmpty(true);
        setSearchQueryTmp(query);
      } else setIsEmpty(false);

      setUsers(data);
    } catch (err) {
      setError(err + "");
    } finally {
      setIsLoading(false);
    }
  };

  // Action handlers
  const handleAddFriend = async (
    userId: number,
    add: boolean = true
  ): Promise<void> => {
    setError("");
    setSuccess("");
    try {
      // const response = await api.post(`/friends/add/${userId}/`);
      const response = await api.post(
        `/friends/${add ? "add" : "remove"}/${userId}/`
      );
      if (response.data.error) throw new Error(response.data.error);
      await searchUsers(searchQuery);
      // setSuccess('User added to friends');
      setSuccess(
        `${
          add ? "User added to your  friends" : "User remove your  from friends"
        }`
      );
    } catch (err) {
      setError(err + "");
    }
  };

  const handleBlock = async (
    userId: number,
    is_blocked: boolean
  ): Promise<void> => {
    try {
      const response = await api.post(
        `/friends/${is_blocked ? "unblock" : "block"}/${userId}/`
      );
      if (response.data.error) throw new Error(response.data.error);
      // setSuccess(`${is_blocked ? 'User unblocked successfully' : 'User blocked successfully'}`);
      await searchUsers(searchQuery);
      setSuccess(` User ${is_blocked ? "unblocked" : "Blocked"} successfully`);
    } catch (err) {
      setError(err + "");
    }
  };

  const handleInviteToMatch = async (userId: number): Promise<void> => {
    send(
      JSON.stringify({
        type: "send_invite",
        target_user_id: userId,
      })
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      searchUsers(searchQuery);
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

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 bg-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && <div className="text-center text-white">Loading...</div>}

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="group flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white group-hover:text-black">
                  {user.username}
                </h3>
                {user.is_online ?(

                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ):
                <></>}
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="flex space-x-2">
              {!user.is_friend && !user.is_blocked && (
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  title="Add Friend"
                >
                  <UserPlus size={20} />
                </button>
              )}

              {user.is_friend && !user.is_blocked && (
                <>
                  <button
                    onClick={() => handleAddFriend(user.id, false)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Unfriend"
                  >
                    <UserPlus size={20} className="transform rotate-45" />
                  </button>
                  <button
                    onClick={() => handleCreateRoom(user.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Message"
                  >
                    <MessageSquare size={20} />
                  </button>

                  <button
                    onClick={() => handleInviteToMatch(user.id)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-full"
                    title="Invite to Match"
                  >
                    <Gamepad2 size={20} />
                  </button>
                </>
              )}

              <button
                onClick={() => handleBlock(user.id, user.is_blocked)}
                className={`p-2 ${
                  user.is_blocked ? "text-gray-600" : "text-red-600"
                } 
                  hover:bg-red-50 rounded-full`}
                title={user.is_blocked ? "Unblock" : "Block"}
              >
                <Ban size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {!isLoading && users.length === 0 && searchQueryTmp && IsEmpty && (
        <div className="text-center text-gray-500 mt-4">
        {`No users found matching "${searchQueryTmp}"`}
        </div>
      )}
    </div>
  );
};

export default UserSearch;
