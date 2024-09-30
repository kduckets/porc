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
            <TableHead>Artist</TableHead>
            <TableHead className="text-right">Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedScores.map(([artist, score], index) => (
            <TableRow key={artist}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>{artist}</TableCell>
              <TableCell className="text-right">{score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}