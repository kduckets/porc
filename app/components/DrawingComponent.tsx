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
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.strokeStyle = 'black'
        context.lineWidth = 2
        context.lineCap = 'round'
        context.lineJoin = 'round'
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCurrentPlayer) return
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    setLastX(x)
    setLastY(y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCurrentPlayer) return
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const { x, y } = getCoordinates(e)
        context.beginPath()
        context.moveTo(lastX, lastY)
        context.lineTo(x, y)
        context.stroke()
        setLastX(x)
        setLastY(y)
      }
    }
  }

  const stopDrawing = () => {
    if (!isCurrentPlayer) return
    setIsDrawing(false)
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        }
      } else {
        return {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
        }
      }
    }
    return { x: 0, y: 0 }
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
            className="border border-gray-300 touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
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