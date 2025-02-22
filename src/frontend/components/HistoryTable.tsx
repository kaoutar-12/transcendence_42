import React, { useState } from "react";
import "@/styles/dashboard.css";
import Image from "next/image";
import { MatchHistoryItem } from "@/app/(dashboard)/home/page";
import { User } from "@/app/chat/[room_id]/page";

interface MatchHistoryProps {
  matches: MatchHistoryItem[];
  user: User;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const matchesPerPage = 8;

  // Calculate the index range for the current page
  const indexOfLastMatch = currentPage * matchesPerPage;
  const indexOfFirstMatch = indexOfLastMatch - matchesPerPage;
  const displayedMatches = matches.slice(indexOfFirstMatch, indexOfLastMatch);

  // Calculate total pages
  const totalPages = Math.ceil(matches.length / matchesPerPage);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="match-history">
      <h1>Matches history</h1>
      <table>
        <thead>
          <tr>
            <th className="flex justify-center">Player 1</th>
            <th>Score</th>
            <th>Result</th>
            <th>Score</th>
            <th className="flex justify-center">Player 2</th>
          </tr>
        </thead>
        <tbody>
          {displayedMatches.map((match, index) => (
            <tr key={index}>
              <td className="flex gap-[20px] items-center justify-center">
                {match.player1}
              </td>
              <td>{match.player1_score}</td>
              <td>
                {match.winner === user.username ? (
                  <span className="result-badge win">Win</span>
                ) : (
                  <span className="result-badge lose">Lose</span>
                )}
              </td>
              <td>{match.player2_score}</td>
              <td>
                <div className="flex flex-row-reverse gap-[20px] items-center justify-center ">
                  {match.player2}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "active" : ""}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
