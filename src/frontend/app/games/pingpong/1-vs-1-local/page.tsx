"use client"

import React, { useEffect, useRef, useState } from "react"
import LoadingAnimation from "@/components/LandingAnimation/LoadingAnimation"
import styles from "@/styles/modules/PingPongGame.module.css"

const CANVAS_WIDTH = 1300
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 120
const BALL_SIZE = 10
const PADDLE_SPEED = 8
const INITIAL_BALL_SPEED = 2
const WIN_SCORE = 1

interface GameState {
  ballX: number
  ballY: number
  ballSpeedX: number
  ballSpeedY: number
  leftPaddleY: number
  rightPaddleY: number
  leftScore: number
  rightScore: number
}

const PingPongGame = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [gameState, setGameState] = useState<GameState>({
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT / 2,
        ballSpeedX: INITIAL_BALL_SPEED,
        ballSpeedY: INITIAL_BALL_SPEED,
        leftPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        rightPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        leftScore: 0,
        rightScore: 0,
    })

    const [isRunning, setIsRunning] = useState(false)
    const [gameLoop, setGameLoop] = useState<number | null>(null)
    const [player1, setPlayer1] = useState("Player 1")
    const [player2, setPlayer2] = useState("Player 2")
    const [gameOver, setGameOver] = useState(false)
    const [winner, setWinner] = useState("")
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext("2d")
        if (!context) return

        const drawGame = () => {
          context.fillStyle = "#1a1a1a"
          context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
          context.fillStyle = "#ffffff"
          context.fillRect(0, gameState.leftPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)
          context.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.rightPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT)
          context.beginPath()
          context.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2)
          context.fill()
          context.setLineDash([5, 15])
          context.beginPath()
          context.moveTo(CANVAS_WIDTH / 2, 0)
          context.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
          context.strokeStyle = "#ffffff"
          context.stroke()
        }

        drawGame()

    }, [gameState])

    useEffect(() => {
        const keysPressed = new Set<string>()

        const handleKeyDown = (e: KeyboardEvent) => {
          keysPressed.add(e.key)
        }

        const handleKeyUp = (e: KeyboardEvent) => {
          keysPressed.delete(e.key)
        }

        const updatePaddles = () => {

        setGameState((prev) => {
              const newState = { ...prev }

              if (keysPressed.has("w") && newState.leftPaddleY > 0) {
                newState.leftPaddleY = Math.max(0, newState.leftPaddleY - PADDLE_SPEED)
              }
              if (keysPressed.has("s") && newState.leftPaddleY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
                newState.leftPaddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.leftPaddleY + PADDLE_SPEED)
              }
              if (keysPressed.has("ArrowUp") && newState.rightPaddleY > 0) {
                newState.rightPaddleY = Math.max(0, newState.rightPaddleY - PADDLE_SPEED)
              }
              if (keysPressed.has("ArrowDown") && newState.rightPaddleY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
                newState.rightPaddleY = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.rightPaddleY + PADDLE_SPEED)
              }

              return newState
          })
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        const paddleInterval = setInterval(updatePaddles, 1000 / 40) // 40 FPS

        return () => {
          window.removeEventListener("keydown", handleKeyDown)
          window.removeEventListener("keyup", handleKeyUp)
          clearInterval(paddleInterval)
        }
    }, [])

    useEffect(() => {
        if (gameOver && gameLoop) {
            clearInterval(gameLoop);
            setGameLoop(null);
            setIsRunning(false);
        }
    }, [gameOver, gameLoop]);

    const updateGame = () => {
        setGameState((prev) => {
          if (prev.leftScore >= WIN_SCORE || prev.rightScore >= WIN_SCORE) {
            setGameOver(true);
            setWinner(prev.leftScore >= WIN_SCORE ? player1 : player2);
            if (gameLoop) {
              clearInterval(gameLoop);
              setGameLoop(null);
            }
            setIsRunning(false);
            return prev;
          }
      
          let newState = { ...prev };
    
          newState.ballX += newState.ballSpeedX;
          newState.ballY += newState.ballSpeedY;
          if (newState.ballY <= 0 || newState.ballY >= CANVAS_HEIGHT) {
            newState.ballSpeedY = -newState.ballSpeedY;
          }

          if (
            (newState.ballX <= PADDLE_WIDTH &&
              newState.ballY >= newState.leftPaddleY &&
              newState.ballY <= newState.leftPaddleY + PADDLE_HEIGHT) ||
            (newState.ballX >= CANVAS_WIDTH - PADDLE_WIDTH &&
              newState.ballY >= newState.rightPaddleY &&
              newState.ballY <= newState.rightPaddleY + PADDLE_HEIGHT)
          ) {
            newState.ballSpeedX = -newState.ballSpeedX * 1.10;
            newState.ballSpeedY *= 1.10;
          }
    
          if (newState.ballX <= 0) {
            newState.rightScore++;
            newState = resetBall(newState);
          } else if (newState.ballX >= CANVAS_WIDTH) {
            newState.leftScore++;
            newState = resetBall(newState);
          }
      
          return newState;
        });
      };

  const resetBall = (state: GameState): GameState => {
    return {
      ...state,
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
      ballSpeedY: INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    }
  }

  const startGame = () => {
    if (!isRunning && !gameOver) {
      setIsRunning(true);
      const loop = window.setInterval(updateGame, 1000 / 60);
      setGameLoop(loop);
    }
  };

  const pauseGame = () => {
    if (isRunning && gameLoop) {
      setIsRunning(false)
      clearInterval(gameLoop)
      setGameLoop(null)
    }
  }

  const stopGame = () => {
    if (gameLoop) {
      clearInterval(gameLoop)
      setGameLoop(null)
    }
    setIsRunning(false)
    setGameState({
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED,
      ballSpeedY: INITIAL_BALL_SPEED,
      leftPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      rightPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      leftScore: 0,
      rightScore: 0,
    })
  }

  const restartGame = () => {
    stopGame()
    setGameOver(false)
    setWinner("")
    setIsRunning(false)
    setGameLoop(null)
    setGameState({
      ballX: CANVAS_WIDTH / 2,
      ballY: CANVAS_HEIGHT / 2,
      ballSpeedX: INITIAL_BALL_SPEED,
      ballSpeedY: INITIAL_BALL_SPEED,
      leftPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      rightPaddleY: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      leftScore: 0,
      rightScore: 0,
    })
    setIsLoading(true)
    setTimeout(() => {
        setIsLoading(false)
    }, 2000);
  }

  if (isLoading) {
      return (
          <div className={styles.loadingScreen}>
              <LoadingAnimation />
          </div>
      )
  }

  return (
      <div className={styles.gameContainer}>
          <div className={styles.header}>
              <div className={styles.playerScore}>
                  <span>{player1}</span>
                  <span>{gameState.leftScore}</span>
              </div>
              <div className={styles.playerScore}>
                  <span>{player2}</span>
                  <span>{gameState.rightScore}</span>
              </div>
          </div>
          <canvas 
              ref={canvasRef} 
              width={CANVAS_WIDTH} 
              height={CANVAS_HEIGHT} 
              className={styles.canvas}
          />
          {!gameOver ? (
              <div className={styles.buttonContainer}>
                  <button 
                      onClick={startGame} 
                      disabled={isRunning} 
                      className={styles.button}
                  >
                      Start
                  </button>
                  <button 
                      onClick={pauseGame} 
                      disabled={!isRunning} 
                      className={styles.button}
                  >
                      Pause
                  </button>
                  <button 
                      onClick={() => { 
                          if (confirm("Sure Restart The Game!") == true) 
                              restartGame() 
                      }} 
                      className={styles.button}
                  >
                      Restart
                  </button>
              </div>
          ) : (
              <div className={styles.winnerMessage}>
                  <h2>{winner} wins!</h2>
                  <div className={styles.buttonContainer}>
                      <button 
                          onClick={restartGame} 
                          className={styles.button}
                      >
                          New Game
                      </button>
                  </div>
              </div>
          )}
          <div className={styles.instructions}>
              <p>Use `W` and `S` keys to move the left paddle</p>
              <p>Use `Up` and `Down` arrow keys to move the right paddle</p>
              <p>First player to score {WIN_SCORE} points wins!</p>
          </div>
      </div>
  )
}

export default PingPongGame
