'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/styles/modules/GamePage.module.css';

// This interface defines the shape of our game state
interface GameState {
  ball: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
  paddles: {
    left: {
      y: number;
      score: number;
    };
    right: {
      y: number;
      score: number;
    };
  };
  game_status: string;
  timestamp: number;
}

export default function GamePage() {
  // Get the game ID from the URL parameters
  const params = useParams();
  const gameId = params.gameId;

  // State management for game
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);

  // Effect to handle WebSocket connection and game state
  useEffect(() => {
    // Create WebSocket connection using the game ID from the route
    const ws = new WebSocket(`ws://localhost:8000/api/ws/game/${gameId}/`);
    
    // Track if the component is mounted to prevent state updates after unmounting
    let isMounted = true;

    // Handle WebSocket connection opening
    ws.onopen = () => {
      if (isMounted) {
        setConnection('connected');
        console.log('Connected to game server');
      }
    };

    // Handle incoming messages from the server
    ws.onmessage = (event) => {
      if (!isMounted) return;

      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'game_state':
            setGameState(data.state);
            break;
          case 'error':
            setError(data.message);
            break;
          case 'event':
            // Handle game events (scoring, etc.)
            console.log('Game event:', data.event);
            break;
        }
      } catch (error) {
        console.error('Error parsing game data:', error);
      }
    };

    // Handle WebSocket errors
    ws.onerror = (error) => {
      if (isMounted) {
        setConnection('error');
        setError('Connection error occurred');
        console.error('WebSocket error:', error);
      }
    };

    // Handle WebSocket connection closing
    ws.onclose = () => {
      if (isMounted) {
        setConnection('error');
        setError('Connection closed');
      }
    };

    // Set up keyboard event listeners for paddle movement
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      switch (event.key) {
        case 'ArrowUp':
          ws.send(JSON.stringify({ type: 'paddle_move', movement: 'up' }));
          break;
        case 'ArrowDown':
          ws.send(JSON.stringify({ type: 'paddle_move', movement: 'down' }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        ws.send(JSON.stringify({ type: 'paddle_move', movement: 'stop' }));
      }
    };

    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Cleanup function to handle component unmounting
    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [gameId]); // Only re-run if gameId changes

  // Render the game interface
  return (
    <div className={styles.container}>
      {connection === 'connecting' && (
        <div className={styles.message}>
          <h2>Connecting to game...</h2>
        </div>
      )}

      {connection === 'error' && (
        <div className={styles.error}>
          <h2>Connection Error</h2>
          <p>{error || 'Failed to connect to the game server'}</p>
        </div>
      )}

      {connection === 'connected' && gameState && (
        <div className={styles.gameContainer}>
          {/* Score display */}
          <div className={styles.scoreBoard}>
            <div className={styles.score}>
              Left: {gameState.paddles.left.score}
            </div>
            <div className={styles.score}>
              Right: {gameState.paddles.right.score}
            </div>
          </div>

          {/* Game canvas */}
          <div className={styles.gameCanvas}
               style={{
                 width: '1300px',
                 height: '600px'
               }}>
            {/* Left paddle */}
            <div className={styles.paddle}
                 style={{
                   left: '0',
                   top: `${gameState.paddles.left.y}px`
                 }} />
            
            {/* Right paddle */}
            <div className={styles.paddle}
                 style={{
                   right: '0',
                   top: `${gameState.paddles.right.y}px`
                 }} />
            
            {/* Ball */}
            <div className={styles.ball}
                 style={{
                   left: `${gameState.ball.x}px`,
                   top: `${gameState.ball.y}px`
                 }} />
          </div>

          {/* Game controls instructions */}
          <div className={styles.instructions}>
            <p>Use ↑ and ↓ arrow keys to move your paddle</p>
          </div>
        </div>
      )}
    </div>
  );
}