import React from "react";
import "@/styles/dashboard.css";

interface LevelBarProps {
  level: number;
  percentage: number; // 0-100
}

const LevelBar: React.FC<LevelBarProps> = ({ percentage, level }) => {
  const clampedLevel = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`level-bar`}
      style={
        {
          "--level": `${clampedLevel}%`,
        } as React.CSSProperties
      }
    >
      <div className="level-bar__fill" />
      <span className="level-bar__label">
        {level} - {clampedLevel}%
      </span>
    </div>
  );
};

export default LevelBar;
