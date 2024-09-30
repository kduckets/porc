import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { ScrollArea } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { DrawingEntry } from '../types'

interface GalleryComponentProps {
  gallery: DrawingEntry[]
  currentPlayer: string | null
  onAddComment: (drawingId: string, comment: string) => void
}

export default function GalleryComponent({ gallery, currentPlayer, onAddComment }: GalleryComponentProps) {
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingEntry | null>(null)
  const [newComment, setNewComment] = useState('')

  const handleAddComment = () => {
    if (selectedDrawing && currentPlayer && newComment.trim()) {
      onAddComment(selectedDrawing.id, newComment.trim())
      setNewComment('')
    }
  }

  const getVoteCounts = (comments: Record<string, { vote: 'poop' | 'cloud', comment: string }> | undefined) => {
    if (!comments) return { poop: 0, cloud: 0 }
    return Object.values(comments).reduce(
      (acc, { vote }) => {
        if (vote === 'poop') acc.poop++
        if (vote === 'cloud') acc.cloud++
        return acc
      },
      { poop: 0, cloud: 0 }
    )
  }

  const reversedGallery = [...gallery].reverse()

  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Art Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {reversedGallery.map((entry) => (
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
                <DialogContent className="w-full sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl text-center mb-2">
                      {entry.title} by {entry.artist}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 flex flex-col items-center">
                    <div className="w-full max-w-md mx-auto">
                      <img
                        src={entry.drawing}
                        alt={`${entry.title} by ${entry.artist}`}
                        className="w-full h-auto max-h-[50vh] object-contain mb-4"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Type: {entry.type}</p>
                    <div className="mt-4 flex justify-center space-x-4">
                      {Object.entries(getVoteCounts(entry.comments)).map(([type, count]) => (
                        <Badge key={type} variant={type === 'poop' ? 'destructive' : 'default'}>
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 w-full">
                      <h4 className="font-semibold mb-2 text-center">Votes and Comments:</h4>
                      <ScrollArea className="h-40 w-full border rounded-md p-2">
                        {entry.comments && Object.entries(entry.comments).length > 0 ? (
                          Object.entries(entry.comments).map(([player, { vote, comment }]) => (
                            <div key={player} className="mb-2 p-2 bg-gray-50 rounded">
                              <p className="font-semibold">{player} {vote && <span className='font-thin italic text-sm'>voted {vote}</span>}</p>
                              {comment && <p className="text-sm text-gray-600">{comment}</p>}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center">No votes or comments for this drawing.</p>
                        )}
                      </ScrollArea>
                    </div>
                    {currentPlayer && (
                      <div className="mt-4 w-full">
                        <Input
                          type="text"
                          placeholder="Add a comment"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full mb-2 text-lg"
                        />
                        <Button onClick={handleAddComment} disabled={!newComment.trim()} className="w-full">
                          Add Comment
                        </Button>
                      </div>
                    )}
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