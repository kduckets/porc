import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Slider } from "./ui/slider"
import { Paintbrush, Eraser, Square, Circle, Droplet, Pipette, Undo2, Redo2 } from 'lucide-react'

interface DrawingComponentProps {
  artist: string
  onSubmit: (drawingData: string, drawingType: 'poop' | 'cloud', title: string) => void
  isCurrentPlayer: boolean
}

type Tool = 'brush' | 'eraser' | 'fill' | 'rectangle' | 'circle' | 'colorPicker'

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#8B4513', '#A52A2A', '#D2691E', '#CD853F', '#DEB887', '#F4A460',
]

export default function DrawingComponent({ artist, onSubmit, isCurrentPlayer }: DrawingComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingType, setDrawingType] = useState<'poop' | 'cloud'>('poop')
  const [title, setTitle] = useState('')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(2)
  const [tool, setTool] = useState<Tool>('brush')
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.fillStyle = '#FFFFFF'
        context.fillRect(0, 0, canvas.width, canvas.height)
        saveState()
      }
    }
  }, [])

  const saveState = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        setUndoStack(prevStack => [...prevStack, context.getImageData(0, 0, canvas.width, canvas.height)])
        setRedoStack([])
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isCurrentPlayer) return
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    setLastPosition({ x, y })
    if (tool === 'fill') {
      fillArea(x, y, color)
    } else if (tool === 'colorPicker') {
      pickColor(x, y)
    }
  }

  const stopDrawing = () => {
    if (!isCurrentPlayer) return
    setIsDrawing(false)
    setLastPosition(null)
    if (tool === 'rectangle' || tool === 'circle') {
      drawShape()
    }
    saveState()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isCurrentPlayer || !lastPosition) return
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const { x, y } = getCoordinates(e)
        
        if (tool === 'brush' || tool === 'eraser') {
          context.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color
          context.lineWidth = brushSize
          context.beginPath()
          context.moveTo(lastPosition.x, lastPosition.y)
          context.lineTo(x, y)
          context.stroke()
        }
        setLastPosition({ x, y })
      }
    }
  }

  const drawShape = () => {
    const canvas = canvasRef.current
    if (canvas && lastPosition) {
      const context = canvas.getContext('2d')
      if (context) {
        const { x, y } = lastPosition
        const { x: endX, y: endY } = getCoordinates({ x: 0, y: 0 })
        context.strokeStyle = color
        context.lineWidth = brushSize
        context.beginPath()
        if (tool === 'rectangle') {
          context.rect(x, y, endX - x, endY - y)
        } else if (tool === 'circle') {
          const radius = Math.sqrt(Math.pow(endX - x, 2) + Math.pow(endY - y, 2))
          context.arc(x, y, radius, 0, 2 * Math.PI)
        }
        context.stroke()
      }
    }
  }

  const fillArea = (x: number, y: number, fillColor: string) => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const targetColor = getPixelColor(imageData, x, y)
        const stack = [{x, y}]
        while (stack.length > 0) {
          const {x, y} = stack.pop()!
          if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
          if (colorMatch(getPixelColor(imageData, x, y), targetColor)) {
            setPixelColor(imageData, x, y, fillColor)
            stack.push({x: x + 1, y}, {x: x - 1, y}, {x, y: y + 1}, {x, y: y - 1})
          }
        }
        context.putImageData(imageData, 0, 0)
      }
    }
  }

  const pickColor = (x: number, y: number) => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        const imageData = context.getImageData(x, y, 1, 1)
        const r = imageData.data[0]
        const g = imageData.data[1]
        const b = imageData.data[2]
        setColor(`rgb(${r},${g},${b})`)
        setTool('brush')
      }
    }
  }

  const getPixelColor = (imageData: ImageData, x: number, y: number): string => {
    const index = (y * imageData.width + x) * 4
    const r = imageData.data[index]
    const g = imageData.data[index + 1]
    const b = imageData.data[index + 2]
    return `rgb(${r},${g},${b})`
  }

  const setPixelColor = (imageData: ImageData, x: number, y: number, color: string) => {
    const index = (y * imageData.width + x) * 4
    const rgbValues = color.match(/\d+/g)
    if (rgbValues && rgbValues.length === 3) {
      imageData.data[index] = parseInt(rgbValues[0])
      imageData.data[index + 1] = parseInt(rgbValues[1])
      imageData.data[index + 2] = parseInt(rgbValues[2])
      imageData.data[index + 3] = 255
    }
  }

  const colorMatch = (color1: string, color2: string): boolean => {
    return color1 === color2
  }

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      if ('touches' in e) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        }
      } else if ('clientX' in e) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      } else {
        return e
      }
    }
    return { x: 0, y: 0 }
  }

  const handleSubmit = () => {
    if (!isCurrentPlayer) return
    const canvas = canvasRef.current
    if (canvas) {
      const drawingData = canvas.toDataURL()
      onSubmit(drawingData, drawingType, title)
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const context = canvas.getContext('2d')
      if (context) {
        context.fillStyle = '#FFFFFF'
        context.fillRect(0, 0, canvas.width, canvas.height)
        saveState()
      }
    }
  }

  const undo = () => {
    if (undoStack.length > 1) {
      const canvas = canvasRef.current
      if (canvas) {
        const context = canvas.getContext('2d')
        if (context) {
          const currentState = undoStack.pop()
          if (currentState) {
            setRedoStack(prevStack => [...prevStack, currentState])
            const previousState = undoStack[undoStack.length - 1]
            context.putImageData(previousState, 0, 0)
          }
        }
      }
    }
  }

  const redo = () => {
    if (redoStack.length > 0) {
      const canvas = canvasRef.current
      if (canvas) {
        const context = canvas.getContext('2d')
        if (context) {
          const nextState = redoStack.pop()
          if (nextState) {
            setUndoStack(prevStack => [...prevStack, nextState])
            context.putImageData(nextState, 0, 0)
          }
        }
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Drawing Phase</h2>
      <p>Artist: {artist}</p>
      {isCurrentPlayer ? (
        <>
          <p>Draw either a poop or a cloud</p>
          <RadioGroup 
            value={drawingType} 
            onValueChange={(value: 'poop' | 'cloud') => setDrawingType(value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2 text-lg">
              <RadioGroupItem value="poop" id="poop" />
              <Label htmlFor="poop">Poop</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cloud" id="cloud" />
              <Label htmlFor="cloud">Cloud</Label>
            </div>
          </RadioGroup>
          <Input
            type="text"
            placeholder="Enter a title for your drawing"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-md"
          />
          <div className="flex flex-wrap gap-2 items-center">
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
            <Button
              variant={tool === 'fill' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('fill')}
            >
              <Droplet className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'rectangle' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'circle' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('circle')}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant={tool === 'colorPicker' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setTool('colorPicker')}
            >
              <Pipette className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={undo}
              disabled={undoStack.length <= 1}
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo2 className="h-4 w-4" />
            </Button>
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
            <Button onClick={handleSubmit} disabled={!title.trim()}>Submit Drawing</Button>
          </div>
        </>
      ) : (
        <p>Waiting for {artist} to draw...</p>
      )}
    </div>
  )
}