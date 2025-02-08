"use client";

import { useState } from "react"
import PlayerEntry from "@/components/gameComps/PlayerEntry";
import TournamentBracket from "@/components/gameComps/TournamentBracket";
import PingPong1vs1 from "@/components/gameComps/PingPong1vs1";
import styles from "@/styles/modules/PingPongTournament.module.css";

type Props = {}

const PingPongTournament = (props: Props) => {

    const [players, setPlayers] = useState<string[]>([])
    const [winner1, setWinner1] = useState<string | null>(null)
    const [winner2, setWinner2] = useState<string | null>(null)
    const [winner3, setWinner3] = useState<string | null>(null)
    const [currentMatch, setCurrentMatch] = useState<number>(-1)

    const getPageContent = () => {

        if (players.length === 0) {
            return <PlayerEntry onStart={(players: string[]) => setPlayers(players)} />
        }

        if (currentMatch === -1) {
            return <TournamentBracket 
                players={players}
                onPlayMatch={(matchIndex: number) => setCurrentMatch(matchIndex)}
                winner1={winner1}
                winner2={winner2}
                winner3={winner3}
            />
        }

        if (currentMatch === 0) {  
            return <PingPong1vs1 
                p1={players[0]}
                p2={players[1]}
                onGameEnd={setWinner1}
                setCurrentGame={setCurrentMatch}
            />
        }

        if (currentMatch === 1) {  
            return <PingPong1vs1 
                p1={players[2]}
                p2={players[3]}
                onGameEnd={setWinner2}
                setCurrentGame={setCurrentMatch}
            />
        }

        if (currentMatch === 2) {  
            return <PingPong1vs1 
                p1={winner1}
                p2={winner2}
                onGameEnd={setWinner3}
                setCurrentGame={setCurrentMatch}
            />
        }

        return (
            <div>  
                Hello World from PingPongTournament {currentMatch}
            </div>
        )
    }

    return (
        <div className={styles.container}>
            { getPageContent() }
        </div>
    )
}

export default PingPongTournament;
