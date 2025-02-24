'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/modules/MatchmakingQueue.module.css';

const MatchmakingQueue = () => {
    const [matchStatus, setMatchStatus] = useState('searching');
    const [gameData, setGameData] = useState<any>(null);
    const [countdown, setCountdown] = useState<number>(3);
    const router = useRouter();

    useEffect(() => {
        
        const ws = new WebSocket(`${process.env.NEXT_PUBLIC_SOCKET_URL}/ws/queue/`);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({ type: 'join_queue' }));
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'match_created') {
                    setMatchStatus('match_created');
                    setGameData(data);
                    let count = 3;
                    const countdownInterval = setInterval(() => {
                        count--;
                        setCountdown(count);
                        if (count === 0) {
                            clearInterval(countdownInterval);
                            router.push(`/games/pingpong/1-vs-1/${data.game_id}`);
                        }
                    }, 1000);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setMatchStatus('error');
        };

        ws.onclose = () => {
            // console.log('Disconnected from matchmaking server');
        };

        return () => {
            ws.close();
        };
    }, [router]);


    if (matchStatus === 'match_created') {
        return (
            <div className={styles.container}>
                <div className={styles.matchFoundState}>
                    <h2 className={styles.title}>Match Found!</h2>
                    <p className={styles.roleText}>You are {gameData.your_role}</p>
                    <p className={styles.countdownText}>
                        Starting game in {countdown} seconds...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {matchStatus === 'searching' && (
                <div className={styles.searchingState}>
                    <h2 className={styles.title}>Searching for opponent...</h2>
                    <div className={styles.spinner} />
                </div>
            )}
            
            {matchStatus === 'match_found' && gameData && (
                <div className={styles.matchFoundState}>
                    <h2 className={styles.title}>Match Found!</h2>
                    <p className={styles.roleText}>You are {gameData.your_role}</p>
                    <p className={styles.countdownText}>
                        Starting game in {countdown} seconds...
                    </p>
                </div>
            )}

            {matchStatus === 'error' && (
                <div className={styles.errorState}>
                    <h2 className={styles.title}>Connection Error</h2>
                    <p className={styles.errorText}>
                        Failed to connect to matchmaking server. Please try again.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MatchmakingQueue
