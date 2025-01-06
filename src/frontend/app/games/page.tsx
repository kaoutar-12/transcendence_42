import React from 'react'
import GameLinkItem from '@/components/GameLinkItem';
import "@/styles/game.css"

type Props = {}

const Games = (props: Props) => {
  return (
    <div className="games-container">
      <div className="games-header">
        <h1>List Of Games</h1>
      </div>
      <div className="games-list">
        <GameLinkItem title="2D Ping Pong" image="/pinpong-game-icon.png" href="/games/pingpong" status="New" />
        <GameLinkItem title="Tic Tac Toe" image="/tictac-game-icon.png" href="/games/tictactoe" status="In progress"/>
      </div>
    </div>
  )
}

export default Games
