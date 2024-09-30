import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

interface DrawingEntry {
  id: string
  drawing: string
  type: 'poop' | 'cloud'
  title: string
  artist: string
}

interface GalleryComponentProps {
  gallery: DrawingEntry[]
}

export default function GalleryComponent({ gallery }: GalleryComponentProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Drawing Gallery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((entry) => (
            <div key={entry.id} className="relative pb-[100%] bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={entry.drawing} 
                alt={`${entry.title} by ${entry.artist}`}
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                <p className="font-bold">{entry.title}</p>
                <p>by {entry.artist}</p>
                <p>Type: {entry.type}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}