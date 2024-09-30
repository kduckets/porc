import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Badge } from "./ui/badge"

interface ResultsComponentProps {
  drawing: string
  drawingType: 'poop' | 'cloud'
  drawingTitle: string
  votes: Record<string, 'poop' | 'cloud'>
  onNextRound: () => void
  currentPlayer: string | null
  currentArtist: string
}

export default function ResultsComponent({
  drawing,
  drawingType,
  drawingTitle,
  votes,
  onNextRound,
  currentPlayer,
  currentArtist
}: ResultsComponentProps) {
  const totalVotes = Object.keys(votes).length
  const correctVotes = Object.values(votes).filter(vote => vote === drawingType).length
  const isCorrectMajority = correctVotes > totalVotes / 2

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="secondary" className="mb-2">Artist</Badge>
          <p className="text-lg font-semibold">{currentArtist}</p>
        </div>
        <div className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={drawing} 
            alt={`Drawing of ${drawingType}`} 
            className="absolute top-0 left-0 w-full h-full object-contain"
          />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{drawingTitle}</h3>
          <p className="text-lg">
            It was a <span className="font-bold">{drawingType}</span>!
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg">
            {correctVotes} out of {totalVotes} guessed correctly
          </p>
          <p className="text-lg font-semibold mt-2">
            {isCorrectMajority ? 'The artist gets a point!' : 'The artist does not get a point.'}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        {currentPlayer === currentArtist && (
          <Button onClick={onNextRound} className="w-full sm:w-auto">
            Start Next Round
          </Button>
        )}
        {currentPlayer !== currentArtist && (
          <p className="text-sm text-gray-600">Waiting for the artist to start the next round...</p>
        )}
      </CardFooter>
    </Card>
  )
}