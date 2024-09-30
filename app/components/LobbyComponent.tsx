import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface LobbyComponentProps {
  players: string[]
  onJoin: (playerName: string) => void
  onStart: () => void
  currentPlayer: string | null
}

export default function LobbyComponent({ players, onJoin, onStart, currentPlayer }: LobbyComponentProps) {
  const [playerName, setPlayerName] = useState('')

  const handleJoin = () => {
    if (playerName.trim()) {
      onJoin(playerName.trim())
      setPlayerName('')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Lobby</h2>
      {!currentPlayer && (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
          <Button onClick={handleJoin}>Join Game</Button>
        </div>
      )}
      {currentPlayer && (
        <p>Welcome, {currentPlayer}! Waiting for other players...</p>
      )}
      <div>
        <h3 className="text-xl font-semibold">Players:</h3>
        <ul className="list-disc list-inside">
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
      {players.length >= 2 && currentPlayer && (
        <Button onClick={onStart}>Start Game</Button>
      )}
    </div>
  )
}