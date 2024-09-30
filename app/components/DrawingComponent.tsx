import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Slider } from "./ui/slider"
import { Paintbrush, Eraser } from 'lucide-react'

interface DrawingComponentProps {
  artist: string
  onSubmit: (drawingData: string, drawingType: 'poop' | 'cloud') => void
  isCurrentPlayer: boolean
}

type Tool = 'brush' | 'eraser'

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

export default function DrawingComponent({ artist, onSubmit, isCurrentPlayer }: DrawingComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud'>('poop')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [tool, setTool] = useState<Tool>('brush')

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.lineCap = 'round'
        context.lineJoin = 'round'
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCurrentPlayer) return
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    if (!isCurrentPlayer) return
    setIsDrawing(false)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCurrentPlayer) return
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const rect = canvas.getBoundingClientRect()
        const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
        const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top
        
        context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
        context.lineWidth = brushSize
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
        context.fillStyle = '#FFFFFF'
        context.fillRect(0, 0, canvas.width, canvas.height)
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
          <div className="flex space-x-4 items-center">
            <div className="flex space-x-2">
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={tool === 'brush' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTool('brush')}
              >
                <Paintbrush className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setTool('eraser')}
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Label htmlFor="brush-size">Brush Size:</Label>
            <Slider
              id="brush-size"
              min={1}
              max={20}
              step={1}
              value={[brushSize]}
              onValueChange={(value) => setBrushSize(value[0])}
              className="w-[200px]"
            />
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="border border-gray-300 touch-none bg-white"
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