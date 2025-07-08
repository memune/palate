export interface TastingNote {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  extractedText?: string;
  ratings: {
    aroma: number;
    acidity: number;
    sweetness: number;
    body: number;
    flavor: number;
    aftertaste: number;
  };
  notes?: string;
  origin?: string;
  roastLevel?: string;
  brewery?: string;
}

export interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}