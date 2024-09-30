import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { ScrollArea } from "./ui/scroll-area"

interface DrawingEntry {
  id: string
  drawing: string
  type: 'poop' | 'cloud'
  title: string
  artist: string
  comments: Record<string, string>
}

interface GalleryComponentProps {
  gallery: DrawingEntry[]
}

export default function GalleryComponent({ gallery }: GalleryComponentProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingEntry | null>(null)

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Art Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {gallery.map((entry) => (
              <Dialog key={entry.id}>
                <DialogTrigger asChild>
                  <button
                    className="relative w-full aspect-square overflow-hidden rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onClick={() => setSelectedDrawing(entry)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={entry.drawing}
                        alt={`${entry.title} by ${entry.artist}`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                      <p className="font-bold truncate">{entry.title}</p>
                      <p className="text-xs truncate">by {entry.artist}</p>
                    </div>
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>{entry.title} by {entry.artist}</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <img
                      src={entry.drawing}
                      alt={`${entry.title} by ${entry.artist}`}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                    <p className="mt-2 text-sm text-gray-500">Type: {entry.type}</p>
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Comments:</h4>
                      <ScrollArea className="h-40 w-full border rounded-md p-2">
                        {Object.entries(entry.comments).map(([player, comment]) => (
                          <div key={player} className="mb-2">
                            <p className="font-semibold">{player}:</p>
                            <p className="text-sm text-gray-600">{comment}</p>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}