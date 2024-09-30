import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"

interface DrawingComponentProps {
  artist: string
  onSubmit: (drawingData: string, drawingType: 'poop' | 'cloud') => void
  isCurrentPlayer: boolean
}

export default function DrawingComponent({ artist, onSubmit, isCurrentPlayer }: DrawingComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud'>('poop')

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.strokeStyle = 'black'
        context.lineWidth = 2
        context.lineCap = 'round'
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCurrentPlayer) return
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    if (!isCurrentPlayer) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.beginPath()
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCurrentPlayer) return
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        context.lineTo(x, y)
        context.stroke()
        context.beginPath()
        context.moveTo(x, y)
      }
    }
  }

  const handleSubmit = () => {
    if (!isCurrentPlayer) return
    const canvas = canvasRef.current
    if (canvas) {
      const drawingData = canvas.toDataURL()
      onSubmit(drawingData, drawingType)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Drawing Phase</h2>
      <p>Artist: {artist}</p>
      {isCurrentPlayer ? (
        <>
          <p>Draw either a poop or a cloud!</p>
          <RadioGroup 
            value={drawingType} 
            onValueChange={(value: 'poop' | 'cloud') => setDrawingType(value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poop" id="poop" />
              <Label htmlFor="poop">Poop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cloud" id="cloud" />
              <Label htmlFor="cloud">Cloud</Label>
            </div>
          </RadioGroup>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-300 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onMouseMove={draw}
          />
          <div className="flex space-x-4">
            <Button onClick={clearCanvas}>Clear Canvas</Button>
            <Button onClick={handleSubmit}>Submit Drawing</Button>
          </div>
        </>
      ) : (
        <p>Waiting for {artist} to draw...</p>
      )}
    </div>
  )
}