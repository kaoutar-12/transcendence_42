import { useState } from "react"
import styles from '@/styles/modules/PlayerEntry.module.css'

interface PlayerEntryProps {
  onStart: (players: string[]) => void
}

export default function PlayerEntry({ onStart }: PlayerEntryProps) {
  const [players, setPlayers] = useState(["", "", "", ""])
  const [errors, setErrors] = useState<string[]>(["", "", "", ""])

  const validateInput = (value: string, index: number): string => {
    if (!value.trim()) {
      return "Name is required"
    }
    if (value.includes(' ')) {
      return "Spaces are not allowed"
    }
    if (value.length > 15) {
      return "Maximum 15 characters allowed"
    }
    const isDuplicate = players.some(
      (player, idx) => idx !== index && 
      player.toLowerCase() === value.toLowerCase()
    )
    if (isDuplicate) {
      return "Name must be unique"
    }
    return ""
  }

  const handleInputChange = (index: number, value: string) => {
    const newPlayers = [...players]
    newPlayers[index] = value
    setPlayers(newPlayers)
    const newErrors = [...errors]
    newErrors[index] = validateInput(value, index)
    setErrors(newErrors)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = players.map((player, index) => 
      validateInput(player, index)
    )
    setErrors(newErrors)
    if (newErrors.every(error => error === "")) {
      onStart(players)
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Enter Player Names</h2>
        
        <div className={styles.inputsContainer}>
          {players.map((player, index) => (
            <div key={index} className={styles.inputWrapper}>
              <input
                type="text"
                placeholder={`Player ${index + 1}`}
                value={player}
                onChange={(e) => handleInputChange(index, e.target.value)}
                className={`${styles.input} ${errors[index] ? styles.inputError : ''}`}
                maxLength={15}
              />
              {errors[index] && (
                <span className={styles.errorMessage}>
                  {errors[index]}
                </span>
              )}
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          className={styles.button}
          disabled={errors.some(error => error !== "")}
        >
          Start Tournament
        </button>
      </form>
    </div>
  )
}
