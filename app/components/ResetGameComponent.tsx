import { Button } from "./ui/button"

interface ResetGameComponentProps {
  onReset: () => void
}

export default function ResetGameComponent({ onReset }: ResetGameComponentProps) {
  return (
    <div className="mt-40">
  
      <Button 
        onClick={onReset}
        variant="destructive"
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Reset Game and Clear Players
      </Button>
      <p className="mb-4 text-sm italic">Warning: This will clear all players and reset the game to its initial state.</p>

    </div>
  )
}