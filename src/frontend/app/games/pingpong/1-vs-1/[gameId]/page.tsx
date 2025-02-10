'use client';

import React, { useEffect, useRef, useState } from 'react';
import LoadingAnimation from "@/components/LandingAnimation/LoadingAnimation";
import { useParams } from 'next/navigation';
import styles from '@/styles/modules/PingPongGame.module.css';

const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 120;
const BALL_SIZE = 10;

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
  const params = useParams();
  const gameId = params.gameId;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connection, setConnection] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");

  // Canvas drawing effect
  useEffect(() => {
    if (!gameState) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const drawGame = () => {
      // Clear canvas
      context.fillStyle = "#1a1a1a";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw paddles
      context.fillStyle = "#ffffff";
      context.fillRect(0, gameState.paddles.left.y, PADDLE_WIDTH, PADDLE_HEIGHT);
      context.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.paddles.right.y, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      context.beginPath();
      context.arc(gameState.ball.x, gameState.ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
      context.fill();

      // Draw center line
      context.setLineDash([5, 15]);
      context.beginPath();
      context.moveTo(CANVAS_WIDTH / 2, 0);
      context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
      context.strokeStyle = "#ffffff";
      context.stroke();
    };

    drawGame();
  }, [gameState]);

  // WebSocket connection effect
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/api/ws/game/${gameId}/`);
    let isMounted = true;

    ws.onopen = () => {
      if (isMounted) {
        setIsLoading(false);
        setConnection('connected');
        console.log('Connected to game server');
      }
    };

    ws.onmessage = (event) => {
      if (!isMounted) return;

      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'game_state':
            setGameState(data.state);
            // Check for game over condition
            if (data.state.paddles.left.score >= 1 || data.state.paddles.right.score >= 1) {
              setGameOver(true);
              setWinner(data.state.paddles.left.score >= 1 ? 'Left Player' : 'Right Player');
            }
            break;
          case 'error':
            setError(data.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing game data:', error);
      }
    };

    ws.onerror = () => {
      if (isMounted) {
        setConnection('error');
        setError('Connection error occurred');
      }
    };

    ws.onclose = () => {
      if (isMounted) {
        setConnection('error');
        setError('Connection closed');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          ws.send(JSON.stringify({ type: 'paddle_move', movement: 'up' }));
          break;
        case 'ArrowDown':
        case 's':
          ws.send(JSON.stringify({ type: 'paddle_move', movement: 'down' }));
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(event.key)) {
        ws.send(JSON.stringify({ type: 'paddle_move', movement: 'stop' }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [gameId]);

  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
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
        <>
          <div className={styles.header}>
            <div className={styles.playerScore}>
              <span>Left Player</span>
              <span>{gameState.paddles.left.score}</span>
            </div>
            <div className={styles.playerScore}>
              <span>Right Player</span>
              <span>{gameState.paddles.right.score}</span>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={styles.canvas}
          />

          {gameOver && (
            <div className={styles.winnerMessage}>
              <h2>{winner} wins!</h2>
            </div>
          )}

          <div className={styles.instructions}>
            <p>Use `W` and `S` keys or ↑ and ↓ arrow keys to move your paddle</p>
            <p>First player to score 5 points wins!</p>
          </div>
        </>
      )}
    </div>
  );
}
