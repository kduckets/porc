import { Button } from "./ui/button"

interface ResultsComponentProps {
  result: 'poop' | 'cloud' | null
  votes: Record<string, 'poop' | 'cloud'>
  drawing: string | null
  drawingType: 'poop' | 'cloud' | null
  onReset: () => void
}

export default function ResultsComponent({ result, votes, drawing, drawingType, onReset }: ResultsComponentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Results</h2>
      {drawing && <img src={drawing} alt="Drawing" className="border border-gray-300 max-w-md mx-auto" />}
      {drawingType && <p className="text-xl">The artist drew a {drawingType}</p>}
      {/* {result && <p className="text-xl">Most players guessed it was a {result}</p>} */}
      <h3 className="text-lg font-semibold">Votes:</h3>
      <ul className="list-disc list-inside">
        {Object.entries(votes).map(([player, vote]) => (
          <li key={player}>
            {player}: {vote}
          </li>
        ))}
      </ul>
      <Button onClick={onReset}>Play Again</Button>
    </div>
  )
}