import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface LobbyComponentProps {
  players: string[]
  onJoin: (playerName: string) => void
  onStart: () => void
  currentPlayer: string | null
  gameInProgress: boolean
}

export default function LobbyComponent({ players, onJoin, onStart, currentPlayer, gameInProgress }: LobbyComponentProps) {
  const [playerName, setPlayerName] = useState('')

  const handleJoin = () => {
    if (playerName.trim()) {
      onJoin(playerName.trim())
      setPlayerName('')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">
        {gameInProgress ? "Join Ongoing Game" : "Lobby"}
      </h2>
      {!currentPlayer && (
        <div className="flex space-x-2">
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
          <Button onClick={handleJoin}>
            {gameInProgress ? "Join Game" : "Join Lobby"}
          </Button>
        </div>
      )}
      {currentPlayer && !gameInProgress && (
        <p>Welcome, {currentPlayer}! Waiting for other players...</p>
      )}
      <div>
        <h3 className="text-xl font-semibold">Players:</h3>
        {Array.isArray(players) && players.length > 0 ? (
          <ul className="list-disc list-inside">
            {players.map((player, index) => (
              <li key={index}>{player}</li>
            ))}
          </ul>
        ) : (
          <p>No players have joined yet.</p>
        )}
      </div>
      {!gameInProgress && Array.isArray(players) && players.length >= 2 && currentPlayer && (
        <Button onClick={onStart}>Start Game</Button>
      )}
      {gameInProgress && !currentPlayer && (
        <p className="text-yellow-500">A game is in progress. Join now to participate in the next round!</p>
      )}
    </div>
  )
}