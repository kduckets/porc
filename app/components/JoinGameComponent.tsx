import { useState } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface JoinGameComponentProps {
  onJoin: (name: string) => void
}

export default function JoinGameComponent({ onJoin }: JoinGameComponentProps) {
  const [name, setName] = useState('')

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Join Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          aria-label="Your name"
        />
        <Button onClick={handleJoin} className="w-full">
          Join Game
        </Button>
      </CardContent>
    </Card>
  )
}