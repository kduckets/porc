import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface LobbyComponentProps {
  players: string[]
  onStart: () => Promise<void>
  currentPlayer: string | null
  onJoin: (name: string) => Promise<void>
}

export default function LobbyComponent({ players, onStart, currentPlayer, onJoin }: LobbyComponentProps) {
  const [name, setName] = useState('')

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Game Lobby</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlayer && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              aria-label="Your name"
            />
            <Button onClick={handleJoin} className="w-full">
              Join Game
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Players in Lobby:</h3>
          <ul className="list-disc list-inside space-y-1">
            {players.map((player) => (
              <li key={player} className="text-sm">
                {player} {player === currentPlayer && <span className="text-green-500">(You)</span>}
              </li>
            ))}
          </ul>
        </div>
        {currentPlayer && players.length >= 2 && (
          <Button onClick={onStart} className="w-full">
            Start Game
          </Button>
        )}
        {players.length < 2 && (
          <p className="text-sm text-center text-gray-500">
            Waiting for more players to join...
          </p>
        )}
      </CardContent>
    </Card>
  )
}