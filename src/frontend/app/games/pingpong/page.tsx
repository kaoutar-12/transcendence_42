import React from 'react'
import "@/styles/game.css"
import GameLinkItem from '@/components/GameLinkItem';

type Props = {}

const PingPong = (props: Props) => {
  return (
    <div className="games-container">
      <div className="games-header">
        <h1>Tic Tac Toe | Chosse a Game Mode </h1>
      </div>
      <div className="games-list">
        <GameLinkItem href="/games/pingpong/vs-random" title="VS Random" image="/vs-random.png" status="In progress" />
        <GameLinkItem href="/games/pingpong/vs-ia" title="VS IA" image="/vs-ia.png" status="In progress" />
      </div>
    </div>
  )
}

export default PingPong
