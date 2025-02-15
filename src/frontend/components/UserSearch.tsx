'use client';
import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { Search, UserPlus, MessageSquare, Ban, Gamepad2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/auth/alert';

// Define interfaces for our data types
interface User {
  id: number;
  username: string;
  email: string;
  isFriend: boolean;
  isBlocked: boolean;
}

const UserSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Fetch users from backend
  const searchUsers = async (query: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/users/search?query=${query}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action handlers
  const handleAddFriend = async (userId: number): Promise<void> => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to add friend');
      await searchUsers(searchQuery);
    } catch (err) {
      setError('Failed to add friend. Please try again.');
    }
  };

  const handleBlock = async (userId: number, isBlocked: boolean): Promise<void> => {
    try {
      const response = await fetch(`/api/friends/${isBlocked ? 'unblock' : 'block'}/${userId}/`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${isBlocked ? 'unblock' : 'block'} user`);
      await searchUsers(searchQuery);
    } catch (err) {
      setError(`Failed to ${isBlocked ? 'unblock' : 'block'} user. Please try again.`);
    }
  };

  const handleInviteToMatch = async (userId: number): Promise<void> => {
    try {
      const response = await fetch('/api/matches/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to send match invitation');
      setError('Match invitation sent successfully!');
    } catch (err) {
      setError('Failed to send match invitation. Please try again.');
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      searchUsers(searchQuery);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && <div className="text-center">Loading...</div>}

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div>
              <h3 className="font-medium">{user.username}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            
            <div className="flex space-x-2">
              {!user.isFriend && !user.isBlocked && (
                <button
                  onClick={() => handleAddFriend(user.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                  title="Add Friend"
                >
                  <UserPlus size={20} />
                </button>
              )}
              
              {user.isFriend && !user.isBlocked && (
                <>
                  <button
                    onClick={() => window.location.href = `/messages/${user.id}`}
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
                onClick={() => handleBlock(user.id, user.isBlocked)}
                className={`p-2 ${user.isBlocked ? 'text-gray-600' : 'text-red-600'} 
                  hover:bg-red-50 rounded-full`}
                title={user.isBlocked ? 'Unblock' : 'Block'}
              >
                <Ban size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {!isLoading && users.length === 0 && searchQuery && (
        <div className="text-center text-gray-500 mt-4">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default UserSearch;