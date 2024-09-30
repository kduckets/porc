import { useState, useRef, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Droplet, Undo, Redo } from 'lucide-react'

interface DrawingComponentProps {
  artist: string
  onSubmit: (drawingData: string, type: 'poop' | 'cloud', title: string) => void
  isCurrentPlayer: boolean
  onJoin: (name: string) => Promise<void>
  currentPlayer: string | null
}

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
  '#C0C0C0', '#808080', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080',
  // Shades of brown
  '#8B4513', '#A52A2A', '#D2691E', '#CD853F', '#DEB887', '#F4A460', '#D2B48C', '#FFDAB9'
]

export default function DrawingComponent({ artist, onSubmit, isCurrentPlayer, onJoin, currentPlayer }: DrawingComponentProps) {
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'poop' | 'cloud'>('poop')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush')
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        saveCanvasState()
      }
    }
  }, [])

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        setUndoStack(prevStack => [...prevStack, ctx.getImageData(0, 0, canvas.width, canvas.height)])
        setRedoStack([])
      }
    }
  }

  const undo = () => {
    const canvas = canvasRef.current
    if (canvas && undoStack.length > 1) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const currentState = undoStack[undoStack.length - 1]
        const previousState = undoStack[undoStack.length - 2]
        setRedoStack(prevStack => [...prevStack, currentState])
        setUndoStack(prevStack => prevStack.slice(0, -1))
        ctx.putImageData(previousState, 0, 0)
      }
    }
  }

  const redo = () => {
    const canvas = canvasRef.current
    if (canvas && redoStack.length > 0) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const nextState = redoStack[redoStack.length - 1]
        setUndoStack(prevStack => [...prevStack, nextState])
        setRedoStack(prevStack => prevStack.slice(0, -1))
        ctx.putImageData(nextState, 0, 0)
      }
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      let x, y
      if ('touches' in e) {
        x = (e.touches[0].clientX - rect.left) * scaleX
        y = (e.touches[0].clientY - rect.top) * scaleY
      } else {
        x = (e.clientX - rect.left) * scaleX
        y = (e.clientY - rect.top) * scaleY
      }
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    saveCanvasState()
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let x, y
    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX
      y = (e.touches[0].clientY - rect.top) * scaleY
    } else {
      x = (e.clientX - rect.left) * scaleX
      y = (e.clientY - rect.top) * scaleY
    }

    if (tool === 'brush' || tool === 'eraser') {
      ctx.strokeStyle = tool === 'eraser' ? 'white' : color
      ctx.lineWidth = brushSize
      ctx.lineCap = 'round'
      ctx.lineTo(x, y)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x, y)
    } else if (tool === 'fill') {
      floodFill(ctx, Math.round(x), Math.round(y), color)
    }
  }

  const floodFill = (ctx: CanvasRenderingContext2D, x: number, y: number, fillColor: string) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
    const targetColor = getPixel(imageData, x, y)
    const fillColorRgb = hexToRgb(fillColor)

    if (!fillColorRgb) return
    if (colorsMatch(targetColor, fillColorRgb)) return

    const queue: [number, number][] = [[x, y]]
    while (queue.length > 0) {
      const [x, y] = queue.pop()!
      if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) continue
      if (!colorsMatch(getPixel(imageData, x, y), targetColor)) continue

      setPixel(imageData, x, y, fillColorRgb)
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const getPixel = (imageData: ImageData, x: number, y: number): [number, number, number, number] => {
    const index = (y * imageData.width + x) * 4
    return [
      imageData.data[index],
      imageData.data[index + 1],
      imageData.data[index + 2],
      imageData.data[index + 3]
    ]
  }

  const setPixel = (imageData: ImageData, x: number, y: number, color: [number, number, number, number]) => {
    const index = (y * imageData.width + x) * 4
    imageData.data[index] = color[0]
    imageData.data[index + 1] = color[1]
    imageData.data[index + 2] = color[2]
    imageData.data[index + 3] = color[3]
  }

  const colorsMatch = (a: [number, number, number, number], b: [number, number, number, number]) => {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
  }

  const hexToRgb = (hex: string): [number, number, number, number] | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16),
      255
    ] : null
  }

  const handleColorPick = (newColor: string) => {
    setColor(newColor)
  }

  const handleEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper: any = new (window as any).EyeDropper()
        const result = await eyeDropper.open()
        setColor(result.sRGBHex)
      } catch (error) {
        console.error('EyeDropper error:', error)
      }
    } else {
      alert('EyeDropper is not supported in this browser.')
    }
  }

  const handleSubmit = () => {
    if (canvasRef.current) {
      const drawingData = canvasRef.current.toDataURL()
      onSubmit(drawingData, type, title)
    }
  }

  const handleJoin = () => {
    if (name.trim()) {
      onJoin(name.trim())
      setName('')
    }
  }

  if (!isCurrentPlayer) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Waiting for {artist} to draw</CardTitle>
        </CardHeader>
        <CardContent>
          {!currentPlayer && (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your name to join"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
              <Button onClick={handleJoin} className="w-full">
                Join Game
              </Button>
            </div>
          )}
          {currentPlayer && (
            <p className="text-center">You've joined the game. Wait for your turn to draw!</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Your Turn to Draw!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-gray-900' : 'border-gray-300'}`}
              style={{ backgroundColor: c }}
              onClick={() => handleColorPick(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-8 h-8 p-0">
                <Droplet className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Pick a color</h4>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to use the eyedropper tool.
                  </p>
                </div>
                <Button onClick={handleEyeDropper}>Use Eyedropper</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => setTool('brush')} variant={tool === 'brush' ? 'default' : 'outline'}>
            Brush
          </Button>
          <Button onClick={() => setTool('eraser')} variant={tool === 'eraser' ? 'default' : 'outline'}>
            Eraser
          </Button>
          <Button onClick={() => setTool('fill')} variant={tool === 'fill' ? 'default' : 'outline'}>
            Fill
          </Button>
          <Button onClick={undo} disabled={undoStack.length <= 1}>
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button onClick={redo} disabled={redoStack.length === 0}>
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="brush-size">Brush Size</Label>
          <Slider
            id="brush-size"
            min={1}
            max={50}
            step={1}
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="border border-gray-300 rounded-lg touch-none w-full h-auto"
        />
        <Input
          type="text"
          placeholder="Enter drawing title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
        <RadioGroup value={type} onValueChange={(value) => setType(value as 'poop' | 'cloud')}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="poop" id="poop" />
            <Label htmlFor="poop">Poop</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cloud" id="cloud" />
            <Label htmlFor="cloud">Cloud</Label>
          </div>
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="w-full">
          Submit Drawing
        </Button>
      </CardFooter>
    </Card>
  )
}