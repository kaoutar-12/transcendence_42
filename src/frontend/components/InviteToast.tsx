import React from 'react'

interface InviteData {
    from_username: string;
    onAccept: () => void;
    onDecline: () => void;
  }
  
  const InviteToast: React.FC<InviteData> = ({from_username,onAccept, onDecline}) => {
    return (
      <div className="flex items-center justify-between p-4  bg-white w-full  rounded-md">
        <div>
          <strong>{from_username}</strong> has invited you!
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-500 text-white rounded-md" onClick={onAccept}>
            Accept
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={onDecline}>
            Decline
          </button>
        </div>
      </div>
    );
  };

export default InviteToast