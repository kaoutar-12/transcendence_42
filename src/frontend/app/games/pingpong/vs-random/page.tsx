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
            setStatus('searching');
        };

        ws.onmessage = (event) => {
            console.log(event.data);
        };

        ws.onclose = () => {
            setStatus('disconnected');
        };

        setSocket(ws);

        // Cleanup on component unmount
        return () => {
            if (ws) {
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
