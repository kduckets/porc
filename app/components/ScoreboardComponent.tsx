interface ScoreboardComponentProps {
    scores: Record<string, number>
  }
  
  export default function ScoreboardComponent({ scores }: ScoreboardComponentProps) {
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])
  
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Scoreboard</h2>
        <ul className="space-y-2">
          {sortedScores.map(([player, score]) => (
            <li key={player} className="flex justify-between">
              <span>{player}</span>
              <span className="font-bold">{score}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }