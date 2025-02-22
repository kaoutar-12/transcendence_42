// components/WinRateCircle.tsx
import React from "react";
import "@/styles/WinRateCircle.css";

interface WinLossCircleProps {
  wins: number;
  losses: number;
  winRate: number;
}

const WinLossCircle: React.FC<WinLossCircleProps> = ({ wins, losses, winRate }) => {
  const total = wins + losses;
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="container-winrate">
      <div
        className="progressRing"
        style={{
          background: `conic-gradient(
              #709CE6 0 ${winPercentage}%,
              #bb151f ${winPercentage}% 100%
            )`,
        }}
      />

      <div className="innerCircle">
        <div className="winRate">{winRate}%</div>
        <div className="stats">
          {wins}W / {losses}L
        </div>
      </div>
    </div>
  );
};

export default WinLossCircle;
