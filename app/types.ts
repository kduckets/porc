export interface DrawingEntry {
    id: string;
    drawing: string;
    type: 'poop' | 'cloud';
    title: string;
    artist: string;
    comments?: Record<string, { vote: 'poop' | 'cloud'; comment: string }>;
  }