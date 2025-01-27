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
        <GameLinkItem href="/games/pingpong/1-vs-1-local" title="1 vs 1 - local" image="/1vs1.png" status="In progress" />
        <GameLinkItem href="#" title="VS Random" image="/vs-random.png" status="In progress" />
        <GameLinkItem href="#" title="VS IA" image="/vs-ia.png" status="For future" />
      </div>
    </div>
  )
}

export default PingPong
