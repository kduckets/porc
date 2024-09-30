import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface ScoreboardComponentProps {
  scores: Record<string, number>
}

export default function ScoreboardComponent({ scores }: ScoreboardComponentProps) {
  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1])

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Scoreboard</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScores.map(([player, score], index) => (
            <TableRow key={player}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{player}</TableCell>
              <TableCell className="text-right">{score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}