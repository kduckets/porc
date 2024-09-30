import { Button } from "./ui/button"

interface ResultsComponentProps {
  drawing: string
  drawingType: 'poop' | 'cloud'
  drawingTitle: string
  votes: Record<string, 'poop' | 'cloud'>
  onNextRound: () => void
}

export default function ResultsComponent({ drawing, drawingType, drawingTitle, votes, onNextRound }: ResultsComponentProps) {
  const totalVotes = Object.keys(votes).length
  const correctVotes = Object.values(votes).filter(vote => vote === drawingType).length

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Results</h2>
      <img src={drawing} alt="Drawing result" className="max-w-md mx-auto" />
      <p className="text-xl font-semibold">"{drawingTitle}"</p>
      <p>The drawing was a {drawingType}!</p>
      <p>Correct guesses: {correctVotes} out of {totalVotes}</p>
      <h3 className="text-lg font-semibold">Votes:</h3>
      <ul>
        {Object.entries(votes).map(([player, vote]) => (
          <li key={player}>{player}: {vote} {vote === drawingType ? "✅" : "❌"}</li>
        ))}
      </ul>
      <Button onClick={onNextRound}>Next Round</Button>
    </div>
  )
}