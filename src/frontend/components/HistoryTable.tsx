// MatchHistory.tsx
import React from 'react';
import "@/styles/dashboard.css";

interface MatchHistoryItem {
  component: string;
  level: number;
  result: string;
  score: string;
  date: string;
}

interface MatchHistoryProps {
  matches: MatchHistoryItem[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  // Show only first 8 matches
  const displayedMatches = matches.slice(0, 8);

  return (
    <div className="match-history">
      <h1>Matches history</h1>
      <table>
        <thead>
          <tr>
            <th>Opponent</th>
            <th>Level</th>
            <th>Result</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {displayedMatches.map((match, index) => (
            <tr key={index}>
              <td>{match.component}</td>
              <td>{match.level}</td>
              <td>
                <span className={`result-badge ${match.result.toLowerCase()}`}>
                  {match.result}
                </span>
              </td>
              <td>{match.score}</td>
              <td>{match.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchHistory;