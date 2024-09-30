import { Button } from "./ui/button"

interface VotingComponentProps {
  drawing: string
  players: string[]
  currentArtist: string
  onVote: (player: string, vote: 'poop' | 'cloud') => void
  currentPlayer: string
}

export default function VotingComponent({ drawing, players, currentArtist, onVote, currentPlayer }: VotingComponentProps) {
  const canVote = currentPlayer !== currentArtist && !players.includes(currentPlayer)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Voting Phase</h2>
      <p>Artist: {currentArtist}</p>
      <img src={drawing} alt="Drawing to vote on" className="max-w-md mx-auto" />
      {canVote ? (
        <div className="flex justify-center space-x-4">
          <Button onClick={() => onVote(currentPlayer, 'poop')}>Vote Poop</Button>
          <Button onClick={() => onVote(currentPlayer, 'cloud')}>Vote Cloud</Button>
        </div>
      ) : (
        <p>{currentPlayer === currentArtist ? "You're the artist! Wait for others to vote." : "Waiting for other players to vote..."}</p>
      )}
    </div>
  )
}