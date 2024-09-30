import { Button } from "./ui/button"

interface VotingComponentProps {
  drawing: string | null
  players: string[]
  currentArtist: string | null
  onVote: (player: string, vote: 'poop' | 'cloud') => void
  currentPlayer: string | null
}

export default function VotingComponent({ drawing, players, currentArtist, onVote, currentPlayer }: VotingComponentProps) {
  const votingPlayers = players.filter(player => player !== currentArtist)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Voting Phase</h2>
      <p>Artist: {currentArtist}</p>
      {drawing && <img src={drawing} alt="Drawing" className="border border-gray-300 max-w-md mx-auto" />}
      {currentPlayer && currentPlayer !== currentArtist ? (
        <div className="space-y-2">
          <p>Cast your vote:</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => onVote(currentPlayer, 'poop')}>Poop</Button>
            <Button onClick={() => onVote(currentPlayer, 'cloud')}>Cloud</Button>
          </div>
        </div>
      ) : (
        <p>{currentPlayer === currentArtist ? "Waiting for others to vote..." : "Please join the game to vote."}</p>
      )}
      <div className="mt-4">
        <h3 className="text-lg font-semibold">Players voting:</h3>
        <ul className="list-disc list-inside">
          {votingPlayers.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}