import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface LobbyComponentProps {
  players: string[]
  onJoin: (name: string) => void
  onStart: () => void
  currentPlayer: string | null
}

export default function LobbyComponent({ players, onJoin, onStart, currentPlayer }: LobbyComponentProps) {
  const [name, setName] = useState('')

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Game Lobby</h2>
      {currentPlayer ? (
        <p>Welcome, {currentPlayer}!</p>
      ) : (
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
          />
          <Button onClick={handleJoin}>Join Game</Button>
        </div>
      )}
      <div>
        <h3 className="text-xl font-semibold">Players:</h3>
        <ul>
          {players.map((player) => (
            <li key={player}>{player}</li>
          ))}
        </ul>
      </div>
      {currentPlayer && players.length >= 2 && (
        <Button onClick={onStart}>Start Game</Button>
      )}
    </div>
  )
}