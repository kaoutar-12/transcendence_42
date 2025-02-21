// components/WinRateCircle.tsx
import React from "react";
import styles from "@/styles/WinRateCircle.module.css";

interface WinLossCircleProps {
  wins: number;
  losses: number;
}

const WinLossCircle: React.FC<WinLossCircleProps> = ({ wins, losses }) => {
  const total = wins + losses;
  const winPercentage = total > 0 ? (wins / total) * 100 : 0;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0.0";

  return (
    <div className={styles.container}>
      {/* Outer ring with win/loss segments */}
      <div
        className={styles.progressRing}
        style={{
          background: `conic-gradient(
              #4CAF50 0 ${winPercentage}%,
              #f44336 ${winPercentage}% 100%
            )`,
        }}
      />

      {/* Inner circle with win rate */}
      <div className={styles.innerCircle}>
        <div className={styles.winRate}>{winRate}%</div>
        <div className={styles.stats}>
          {wins}W / {losses}L
        </div>
      </div>
    </div>
  );
};

export default WinLossCircle;
