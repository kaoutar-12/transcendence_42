import { useState } from 'react';
import styles from '@/styles/modules/TournamentBracket.module.css';

interface TournamentBracketProps {
    players: string[]
    onPlayMatch: (matchIndex: number) => void
    winner1: string | null
    winner2: string | null
    winner3: string | null
}

export default function TournamentBracket({ 
    players, 
    onPlayMatch, 
    winner1, 
    winner2, 
    winner3 
}: TournamentBracketProps) {
    // Function to determine if a match can be played based on tournament progress
    const canPlayMatch = (matchIndex: number): boolean => {
        switch (matchIndex) {
            case 0: // First semi-final
                return winner1 === null;
            case 1: // Second semi-final
                return winner2 === null;
            case 2: // Final match
                // Can only play final if both semi-finals have winners
                return winner1 !== null && winner2 !== null && winner3 === null;
            default:
                return false;
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.semiFinals}>
                <div className={styles.match}>
                    <h3 className={styles.matchTitle}>Semi-Final 1</h3>
                    <div className={styles.matchPlayers}>
                        <span className={winner1 === players[0] ? styles.winner : ''}>
                            {players[0]}
                        </span>
                        <span className={styles.vs}>vs</span>
                        <span className={winner1 === players[1] ? styles.winner : ''}>
                            {players[1]}
                        </span>
                    </div>
                    <button 
                        onClick={() => onPlayMatch(0)} 
                        className={styles.button}
                        disabled={!canPlayMatch(0)}
                    >
                        {winner1 ? 'Match Completed' : 'Play Match'}
                    </button>
                </div>

                <div className={styles.match}>
                    <h3 className={styles.matchTitle}>Semi-Final 2</h3>
                    <div className={styles.matchPlayers}>
                        <span className={winner2 === players[2] ? styles.winner : ''}>
                            {players[2]}
                        </span>
                        <span className={styles.vs}>vs</span>
                        <span className={winner2 === players[3] ? styles.winner : ''}>
                            {players[3]}
                        </span>
                    </div>
                    <button 
                        onClick={() => onPlayMatch(1)} 
                        className={styles.button}
                        disabled={!canPlayMatch(1)}
                    >
                        {winner2 ? 'Match Completed' : 'Play Match'}
                    </button>
                </div>
            </div>

            <div className={`${styles.match} ${styles.final}`}>
                <h3 className={styles.matchTitle}>Final</h3>
                <div className={styles.matchPlayers}>
                    <span className={winner3 === winner1 ? styles.winner : ''}>
                        {winner1 || 'Winner of Semi-Final 1'}
                    </span>
                    <span className={styles.vs}>vs</span>
                    <span className={winner3 === winner2 ? styles.winner : ''}>
                        {winner2 || 'Winner of Semi-Final 2'}
                    </span>
                </div>
                <button 
                    onClick={() => onPlayMatch(2)} 
                    className={styles.button}
                    disabled={!canPlayMatch(2)}
                >
                    {winner3 ? 'Tournament Complete' : 'Play Final'}
                </button>
            </div>
        </div>
    )
}
