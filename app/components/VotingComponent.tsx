import { useState } from 'react'
import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"

interface VotingComponentProps {
  drawing: string
  players: string[]
  currentArtist: string
  onVote: (player: string, vote: 'poop' | 'cloud', comment: string) => void
  currentPlayer: string | null
  votes: Record<string, { vote: 'poop' | 'cloud', comment: string }>
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
  const [vote, setVote] = useState<'poop' | 'cloud'>('poop')
  const [comment, setComment] = useState('')

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  const handleVote = () => {
    if (currentPlayer) {
      onVote(currentPlayer, vote, comment)
    }
  }

  const handleNextRound = () => {
    const nonArtistPlayers = players.filter(player => player !== currentArtist)
    const nextArtist = nonArtistPlayers[Math.floor(Math.random() * nonArtistPlayers.length)]
    onNextRound(nextArtist)
  }

  const allVotesSubmitted = Object.keys(votes).length === players.length - 1 // Excluding the artist

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Voting Time!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img src={drawing} alt="Drawing to vote on" className="max-w-full h-auto max-h-96 object-contain" />
        </div>
        {currentPlayer && currentPlayer !== currentArtist && !votes[currentPlayer] && (
          <div className="space-y-4">
            <RadioGroup value={vote} onValueChange={(value) => setVote(value as 'poop' | 'cloud')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poop" id="poop" />
                <Label htmlFor="poop">Poop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cloud" id="cloud" />
                <Label htmlFor="cloud">Cloud</Label>
              </div>
            </RadioGroup>
            <Input
              type="text"
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleVote} className="w-full">Submit Vote</Button>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Votes:</h3>
          {Object.entries(votes).map(([player, { vote, comment }]) => (
            <div key={player} className="p-2 bg-gray-100 rounded">
              <p><strong>{player}:</strong> {vote}</p>
              {comment && <p className="text-sm text-gray-600">Comment: {comment}</p>}
            </div>
          ))}
        </div>
        {currentPlayer === currentArtist && allVotesSubmitted && (
          <Button onClick={handleNextRound} className="w-full">Next Round</Button>
        )}
      </CardContent>
      {!currentPlayer && (
        <CardFooter>
          <div className="w-full space-y-4">
            <Input
              type="text"
              placeholder="Enter your name to join"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleJoin} className="w-full">Join Game</Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}