// // MatchHistory.tsx
// import React from 'react';
// import "@/styles/dashboard.css";

// interface MatchHistoryItem {
//   component: string;
//   level: number;
//   result: string;
//   score: string;
//   date: string;
// }

// interface MatchHistoryProps {
//   matches: MatchHistoryItem[];
// }

// const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
//   // Show only first 8 matches
//   const displayedMatches = matches.slice(0, 8);

//   return (
//     <div className="match-history">
//       <h1>Matches history</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Opponent</th>
//             <th>Level</th>
//             <th>Result</th>
//             <th>Score</th>
//             <th>Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {displayedMatches.map((match, index) => (
//             <tr key={index}>
//               <td>{match.component}</td>
//               <td>{match.level}</td>
//               <td>
//                 <span className={`result-badge ${match.result.toLowerCase()}`}>
//                   {match.result}
//                 </span>
//               </td>
//               <td>{match.score}</td>
//               <td>{match.date}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default MatchHistory;

import React, { useState } from "react";
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
