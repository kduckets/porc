import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"

interface ResultsComponentProps {
  drawing: string
  drawingType: 'poop' | 'cloud'
  votes: Record<string, 'poop' | 'cloud'>
  onNextRound: () => void
}

export default function ResultsComponent({ drawing, drawingType, votes, onNextRound }: ResultsComponentProps) {
  const totalVotes = Object.keys(votes).length
  const correctVotes = Object.values(votes).filter(vote => vote === drawingType).length
  const incorrectVotes = totalVotes - correctVotes

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <img src={drawing} alt="Drawing" className="max-w-full h-auto" />
        </div>
        <p className="text-center text-lg font-semibold">
          The drawing was a {drawingType}!
        </p>
        <div className="text-center">
          <p>Correct guesses: {correctVotes}</p>
          <p>Incorrect guesses: {incorrectVotes}</p>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Votes:</h3>
          {Object.entries(votes).map(([player, vote]) => (
            <p key={player}>
              {player}: {vote} {vote === drawingType ? "✅" : "❌"}
            </p>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onNextRound}>Next Round</Button>
      </CardFooter>
    </Card>
  )
}