"use client"

import React, { useEffect, useRef, useState } from "react"
import LoadingAnimation from "@/components/LandingAnimation/LoadingAnimation"
import styles from "@/styles/modules/PingPongGame.module.css"

const CANVAS_WIDTH = 1300
const CANVAS_HEIGHT = 600
const PADDLE_WIDTH = 10
const PADDLE_HEIGHT = 100 // Slightly smaller paddles for 2v2
const BALL_SIZE = 10
const PADDLE_SPEED = 8
const INITIAL_BALL_SPEED = 2
const WIN_SCORE = 1
const MIN_PADDLE_GAP = 20 // Minimum gap between team paddles

interface GameState {
  ballX: number
  ballY: number
  ballSpeedX: number
  ballSpeedY: number
  leftPaddleTopY: number
  leftPaddleBottomY: number
  rightPaddleTopY: number
  rightPaddleBottomY: number
  leftScore: number
  rightScore: number
}

export default function PingPong2v2Page() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [gameState, setGameState] = useState<GameState>({
        ballX: CANVAS_WIDTH / 2,
        ballY: CANVAS_HEIGHT / 2,
        ballSpeedX: INITIAL_BALL_SPEED,
        ballSpeedY: INITIAL_BALL_SPEED,
        leftPaddleTopY: CANVAS_HEIGHT / 4,
        leftPaddleBottomY: (3 * CANVAS_HEIGHT) / 4,
        rightPaddleTopY: CANVAS_HEIGHT / 4,
        rightPaddleBottomY: (3 * CANVAS_HEIGHT) / 4,
        leftScore: 0,
        rightScore: 0,
    })

    const [isRunning, setIsRunning] = useState(false)
    const [gameLoop, setGameLoop] = useState<number | null>(null)
    const [team1Player1, setTeam1Player1] = useState("Team 1 Top")
    const [team1Player2, setTeam1Player2] = useState("Team 1 Bottom")
    const [team2Player1, setTeam2Player1] = useState("Team 2 Top")
    const [team2Player2, setTeam2Player2] = useState("Team 2 Bottom")
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
            // Clear canvas
            context.fillStyle = "#1a1a1a"
            context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

            // Draw paddles
            context.fillStyle = "#ffffff"
            // Left team paddles
            context.fillRect(0, gameState.leftPaddleTopY, PADDLE_WIDTH, PADDLE_HEIGHT)
            context.fillRect(0, gameState.leftPaddleBottomY, PADDLE_WIDTH, PADDLE_HEIGHT)
            // Right team paddles
            context.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.rightPaddleTopY, PADDLE_WIDTH, PADDLE_HEIGHT)
            context.fillRect(CANVAS_WIDTH - PADDLE_WIDTH, gameState.rightPaddleBottomY, PADDLE_WIDTH, PADDLE_HEIGHT)

            // Draw ball
            context.beginPath()
            context.arc(gameState.ballX, gameState.ballY, BALL_SIZE / 2, 0, Math.PI * 2)
            context.fill()

            // Draw center line
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

                // Team 1 Top Player (W/S)
                if (keysPressed.has("w") && newState.leftPaddleTopY > 0) {
                    newState.leftPaddleTopY = Math.max(0, newState.leftPaddleTopY - PADDLE_SPEED)
                }
                if (keysPressed.has("s") && 
                    newState.leftPaddleTopY < newState.leftPaddleBottomY - PADDLE_HEIGHT - MIN_PADDLE_GAP) {
                    newState.leftPaddleTopY += PADDLE_SPEED
                }

                // Team 1 Bottom Player (X/C)
                if (keysPressed.has("x") && 
                    newState.leftPaddleBottomY > newState.leftPaddleTopY + PADDLE_HEIGHT + MIN_PADDLE_GAP) {
                    newState.leftPaddleBottomY -= PADDLE_SPEED
                }
                if (keysPressed.has("c") && newState.leftPaddleBottomY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
                    newState.leftPaddleBottomY += PADDLE_SPEED
                }

                // Team 2 Top Player (O/P)
                if (keysPressed.has("o") && newState.rightPaddleTopY > 0) {
                    newState.rightPaddleTopY = Math.max(0, newState.rightPaddleTopY - PADDLE_SPEED)
                }
                if (keysPressed.has("p") && 
                    newState.rightPaddleTopY < newState.rightPaddleBottomY - PADDLE_HEIGHT - MIN_PADDLE_GAP) {
                    newState.rightPaddleTopY += PADDLE_SPEED
                }

                // Team 2 Bottom Player (ArrowUp/ArrowDown)
                if (keysPressed.has("ArrowUp") && 
                    newState.rightPaddleBottomY > newState.rightPaddleTopY + PADDLE_HEIGHT + MIN_PADDLE_GAP) {
                    newState.rightPaddleBottomY -= PADDLE_SPEED
                }
                if (keysPressed.has("ArrowDown") && newState.rightPaddleBottomY < CANVAS_HEIGHT - PADDLE_HEIGHT) {
                    newState.rightPaddleBottomY += PADDLE_SPEED
                }

                return newState
            })
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("keyup", handleKeyUp)

        const paddleInterval = setInterval(updatePaddles, 1000 / 40)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("keyup", handleKeyUp)
            clearInterval(paddleInterval)
        }
    }, [])

    useEffect(() => {
        if (gameOver && gameLoop) {
            clearInterval(gameLoop)
            setGameLoop(null)
            setIsRunning(false)
        }
    }, [gameOver, gameLoop])

    const updateGame = () => {
        setGameState((prev) => {
            if (prev.leftScore >= WIN_SCORE || prev.rightScore >= WIN_SCORE) {
                setGameOver(true)
                setWinner(prev.leftScore >= WIN_SCORE ? "Team 1" : "Team 2")
                if (gameLoop) {
                    clearInterval(gameLoop)
                    setGameLoop(null)
                }
                setIsRunning(false)
                return prev
            }

            let newState = { ...prev }

            // Move ball
            newState.ballX += newState.ballSpeedX
            newState.ballY += newState.ballSpeedY

            // Ball collision with top and bottom walls
            if (newState.ballY <= 0 || newState.ballY >= CANVAS_HEIGHT) {
                newState.ballSpeedY = -newState.ballSpeedY
            }

            // Ball collision with paddles
            // Left team paddles
            if (newState.ballX <= PADDLE_WIDTH) {
                if ((newState.ballY >= newState.leftPaddleTopY && 
                     newState.ballY <= newState.leftPaddleTopY + PADDLE_HEIGHT) ||
                    (newState.ballY >= newState.leftPaddleBottomY && 
                     newState.ballY <= newState.leftPaddleBottomY + PADDLE_HEIGHT)) {
                    newState.ballSpeedX = -newState.ballSpeedX * 1.10
                    newState.ballSpeedY *= 1.10
                }
            }
            // Right team paddles
            if (newState.ballX >= CANVAS_WIDTH - PADDLE_WIDTH) {
                if ((newState.ballY >= newState.rightPaddleTopY && 
                     newState.ballY <= newState.rightPaddleTopY + PADDLE_HEIGHT) ||
                    (newState.ballY >= newState.rightPaddleBottomY && 
                     newState.ballY <= newState.rightPaddleBottomY + PADDLE_HEIGHT)) {
                    newState.ballSpeedX = -newState.ballSpeedX * 1.10
                    newState.ballSpeedY *= 1.10
                }
            }

            // Score points
            if (newState.ballX <= 0) {
                newState.rightScore++
                newState = resetBall(newState)
            } else if (newState.ballX >= CANVAS_WIDTH) {
                newState.leftScore++
                newState = resetBall(newState)
            }

            return newState
        })
    }

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
            setIsRunning(true)
            const loop = window.setInterval(updateGame, 1000 / 60)
            setGameLoop(loop)
        }
    }

    const pauseGame = () => {
        if (isRunning && gameLoop) {
            setIsRunning(false)
            clearInterval(gameLoop)
            setGameLoop(null)
        }
    }

    const restartGame = () => {
        if (gameLoop) {
            clearInterval(gameLoop)
            setGameLoop(null)
        }
        setIsRunning(false)
        setGameOver(false)
        setWinner("")
        setGameState({
            ballX: CANVAS_WIDTH / 2,
            ballY: CANVAS_HEIGHT / 2,
            ballSpeedX: INITIAL_BALL_SPEED,
            ballSpeedY: INITIAL_BALL_SPEED,
            leftPaddleTopY: CANVAS_HEIGHT / 4,
            leftPaddleBottomY: (3 * CANVAS_HEIGHT) / 4,
            rightPaddleTopY: CANVAS_HEIGHT / 4,
            rightPaddleBottomY: (3 * CANVAS_HEIGHT) / 4,
            leftScore: 0,
            rightScore: 0,
        })
        setIsLoading(true)
        setTimeout(() => {
            setIsLoading(false)
        }, 2000)
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
                    <span>Team 1</span>
                    <span>{gameState.leftScore}</span>
                </div>
                <div className={styles.playerScore}>
                    <span>Team 2</span>
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
                            if (confirm("Sure Restart The Game!")) 
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
                <p>Team 1: Top player uses `W`/`S`, Bottom player uses `X`/`C`</p>
                <p>Team 2: Top player uses `O`/`P`, Bottom player uses ↑/↓ arrows</p>
                <p>First team to score {WIN_SCORE} points wins!</p>
            </div>
        </div>
    )
}
