import { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { database } from '../firebase'
import { ref, onValue, push, set } from 'firebase/database'

interface LobbyComponentProps {
  players: string[]
  onJoin: (name: string) => void
  onStart: () => void
  currentPlayer: string | null
}

interface Game {
  id: string
  players: string[]
  state: 'lobby' | 'drawing' | 'voting' | 'results'
}

export default function LobbyComponent({ players, onJoin, onStart, currentPlayer }: LobbyComponentProps) {
  const [name, setName] = useState('')
  const [gamesInProgress, setGamesInProgress] = useState<Game[]>([])

  useEffect(() => {
    const gamesRef = ref(database, 'games')
    const unsubscribe = onValue(gamesRef, (snapshot) => {
      const gamesData = snapshot.val()
      if (gamesData) {
        const gamesList = Object.entries(gamesData).map(([id, game]: [string, any]) => ({
          id,
          players: game.players || [],
          state: game.state || 'lobby'
        }))
        setGamesInProgress(gamesList)
      } else {
        setGamesInProgress([])
      }
    })

    return () => unsubscribe()
  }, [])

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
    }
  }

  const createNewGame = () => {
    const newGameRef = push(ref(database, 'games'))
    set(newGameRef, {
      players: [currentPlayer],
      state: 'lobby'
    })
  }

  const joinExistingGame = (gameId: string) => {
    const gameRef = ref(database, `games/${gameId}/players`)
    push(gameRef, currentPlayer)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Lobby</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlayer ? (
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleJoin}>Join</Button>
          </div>
        ) : (
          <>
            <p>Welcome, {currentPlayer}!</p>
            <div>
              <h3 className="font-semibold mb-2">Players in lobby:</h3>
              <ul>
                {players.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Games in Progress:</h3>
              {gamesInProgress.length > 0 ? (
                <ul>
                  {gamesInProgress.map((game) => (
                    <li key={game.id} className="mb-2">
                      Game {game.id.slice(0, 6)} - {game.players.length} players - {game.state}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => joinExistingGame(game.id)}
                      >
                        Join
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No games in progress</p>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentPlayer && (
          <>
            <Button onClick={createNewGame}>Create New Game</Button>
            <Button onClick={onStart}>Start Game</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}