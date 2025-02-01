import React from "react";
import "@/styles/dashboard.css";

export default function Home() {
  return (
    <div className="home">
      <div className="profile-info">
        <div className="avatar"></div>
        <div className="info">
          <div className="friends-list">
            <span>Friends</span>
            <span>3</span>
          </div>
          <div className="username">Username</div>
          <div className="online">online</div>
        </div>
      </div>
    </div>
  );
}
