import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"

interface VotingComponentProps {
  drawing: string
  players: string[]
  currentArtist: string
  onVote: (player: string, vote: 'poop' | 'cloud') => void
  currentPlayer: string | null
  votes: Record<string, 'poop' | 'cloud'>
  onJoin: (name: string) => Promise<void>
  onNextRound: (nextArtist: string) => void
}

export default function VotingComponent({ 
  drawing, 
  players, 
  currentArtist, 
  onVote, 
  currentPlayer,
  votes,
  onJoin,
  onNextRound
}: VotingComponentProps) {
  const [name, setName] = useState('')
  const canVote = currentPlayer && players.includes(currentPlayer) && currentPlayer !== currentArtist && !votes[currentPlayer]
  const allVotesSubmitted = Object.keys(votes).length === players.length - 1

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  const handleNextRound = () => {
    if (currentPlayer) {
      onNextRound(currentPlayer)
    }
  }

  const getVoteMessage = () => {
    if (!currentPlayer) return "You need to join the game to vote."
    if (!players.includes(currentPlayer)) return "You're not part of this game. Please join to vote."
    if (currentPlayer === currentArtist) return "You're the artist! Wait for others to vote."
    if (votes[currentPlayer]) return `You voted: ${votes[currentPlayer]}`
    return "Waiting for other players to vote..."
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Voting Phase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlayer && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your name to join"
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
        <div className="text-center">
          <Badge variant="secondary" className="mb-2">Artist</Badge>
          <p className="text-lg font-semibold">{currentArtist}</p>
        </div>
        <div className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={drawing} 
            alt="Drawing to vote on" 
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        </div>
        {canVote ? (
          <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button onClick={() => onVote(currentPlayer, 'poop')} className="w-full sm:w-auto">
              Vote Poop
            </Button>
            <Button onClick={() => onVote(currentPlayer, 'cloud')} className="w-full sm:w-auto">
              Vote Cloud
            </Button>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-600">{getVoteMessage()}</p>
        )}
        {allVotesSubmitted && currentPlayer && (
          <Button onClick={handleNextRound} className="w-full">
            Next Round (You'll be the artist)
          </Button>
        )}
      </CardContent>
      <CardFooter>
        <p className="w-full text-center text-sm text-gray-600">
          Votes cast: {Object.keys(votes).length} / {players.length - 1}
        </p>
      </CardFooter>
    </Card>
  )
}