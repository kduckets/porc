import { Button } from "./ui/button"

interface VotingComponentProps {
  drawing: string
  players: string[]
  currentArtist: string
  onVote: (player: string, vote: 'poop' | 'cloud') => void
  currentPlayer: string | null
  votes: Record<string, 'poop' | 'cloud'>
}

export default function VotingComponent({ 
  drawing, 
  players, 
  currentArtist, 
  onVote, 
  currentPlayer,
  votes
}: VotingComponentProps) {
  const canVote = currentPlayer && players.includes(currentPlayer) && currentPlayer !== currentArtist && !votes[currentPlayer]

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
        <p>
          {!currentPlayer ? "You need to join the game to vote." :
           !players.includes(currentPlayer) ? "You're not part of this game. Please join to vote." :
           currentPlayer === currentArtist ? "You're the artist! Wait for others to vote." : 
           votes[currentPlayer] ? `You voted: ${votes[currentPlayer]}` : 
           "Waiting for other players to vote..."}
        </p>
      )}
      <p>Votes cast: {Object.keys(votes).length} / {players.length - 1}</p>
    </div>
  )
}