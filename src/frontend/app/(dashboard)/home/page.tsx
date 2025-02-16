'use client';
import React from "react";
import "@/styles/dashboard.css";
import { useRouter } from 'next/navigation';

import LevelBar from "@/components/ProcessBar";
import MatchHistory from "@/components/HistoryTable";

interface MatchHistoryItem {
  component: string;
  level: number;
  result: string;
  score: string;
  date: string;
}

const sampleMatches: MatchHistoryItem[] = [
  { component: "Player", level: 2, result: "WIN", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
  { component: "Player", level: 2, result: "LOSE", score: "5 - 2", date: "09/09/2024" },
];
export default function Home() {
  const router = useRouter();
  return (
    <div className="home">
      <section>
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
        {/* <LevelBar level={4} percentage={30} /> */}
      <button 
          onClick={()=>{router.push('/search')}}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg"
        >
          Search Players
        </button>
      <section>
      </section>
        <div className="grid-container">
          <div className="item-1">1</div>
          <div className="item-2">2</div>
          <div className="item-3">
            <MatchHistory matches={sampleMatches} />
          </div>
        </div>
      </section>
    </div>
  );
}
