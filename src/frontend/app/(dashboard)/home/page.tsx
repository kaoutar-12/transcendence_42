import React from "react";
import "@/styles/dashboard.css";

export default function Home() {
  return (
    <div className="home">
      <div className="profile-info">
        <div className="avatar"></div>
        <div className="info">
          <div className="friends-list">
            <div className="friends">Friends</div>
            <div>3</div>
          </div>
          <div className="username">Username</div>
          <div className="online">
            <span>Online</span>
            <div className="online-col"></div>
          </div>
        </div>
      </div>
    </div>
  );
}