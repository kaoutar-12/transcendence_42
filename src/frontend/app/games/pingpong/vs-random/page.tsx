"use client";

// components/MatchmakingQueue.tsx
import { useState, useEffect } from 'react';


const MatchmakingQueue = () => {
    const [status, setStatus] = useState('waiting');
    const [socket, setSocket] = useState<WebSocket | null>(null);


    useEffect(() => {
        // Connect to matchmaking WebSocket
        const ws = new WebSocket('ws://localhost:8000/api/ws/queue/');
        
        ws.onopen = () => {
            setStatus('connected');
            ws.send(JSON.stringify({'type':'join_queue'}));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log(data);
            if (data.type === 'match_created') {
                setStatus('match_created');
                const gameSocket = new WebSocket(`ws://localhost:8000/api/ws/game/${data.game_id}/`);
            gameSocket.onopen = () => {
                console.log('Game socket connected');
                window.location.href = `/games/pingpong/vs-random/${data.game_id}/`;
            };
            gameSocket.onmessage = (event) => {
                const gamedata = JSON.parse(event.data);

            }
            
        };

        ws.onclose = () => {
            setStatus('disconnected');
        };

        setSocket(ws);

        // Cleanup on component unmount
        return () => {
            if (ws) {
                socket.send(JSON.stringify({'type':'leave_queue'}));
                ws.close();
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center">
            Hello World, Match making
        </div>
    );
};

export default MatchmakingQueue;
