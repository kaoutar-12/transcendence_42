import React from 'react'
import Link from "next/link";
import Image from "next/image";
import "@/styles/game.css"

type Props = {}

const Games = (props: Props) => {
  return (
    <div className="games-container">
      <div className="games-header">
        <h1>List Of Games</h1>
      </div>
      <div className="games-list">
        <div className='game-item'>
          <Link className="link" href="/games/pingpong">
            <div className='title'>Ping Pong</div>
            <Image src="/pinpong-game-icon.png" alt="pingpong-game-icon.png" width={100} height={100} />
          </Link>
        </div>
        <div className='game-item'>
          <Link className="link" href="/games/tictactoe">
            <div className='title'>Tic Tac Toe</div>
            <Image src="/tictac-game-icon.png" alt="tictac-game-icon.png" width={100} height={100} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Games
