import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface DrawingComponentProps {
  artist: string
  onSubmit: (drawingData: string, type: 'poop' | 'cloud', title: string) => void
  isCurrentPlayer: boolean
  onJoin: (name: string) => Promise<void>
  currentPlayer: string | null
}

export default function DrawingComponent({ 
  artist, 
  onSubmit, 
  isCurrentPlayer,
  onJoin,
  currentPlayer
}: DrawingComponentProps) {
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud'>('poop')
  const [title, setTitle] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const handleSubmit = () => {
    if (canvasRef.current) {
      const drawingData = canvasRef.current.toDataURL()
      onSubmit(drawingData, drawingType, title)
    }
  }

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Drawing Phase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlayer && (
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your name to join"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
              aria-label="Your name"
            />
            <Button onClick={handleJoin} className="w-full">
              Join Game
            </Button>
          </div>
        )}
        <p className="text-center text-lg font-semibold">Current Artist: {artist}</p>
        {isCurrentPlayer ? (
          <>
            <div className="flex justify-between items-center">
              <Select onValueChange={(value) => setDrawingType(value as 'poop' | 'cloud')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select drawing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poop">Poop</SelectItem>
                  <SelectItem value="cloud">Cloud</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Enter drawing title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="max-w-xs"
              />
            </div>
            <div className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute top-0 left-0 w-full h-full cursor-crosshair"
              />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={!drawingType || !title}>
              Submit Drawing
            </Button>
          </>
        ) : (
          <p className="text-center">Waiting for {artist} to finish drawing...</p>
        )}
      </CardContent>
    </Card>
  )
}