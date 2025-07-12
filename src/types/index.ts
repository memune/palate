export interface TastingNote {
  id: string;
  title: string;
  date: string;
  created_at: string;
  
  // Coffee Information (matching database schema)
  country?: string;
  farm?: string;
  region?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  cup_notes?: string;  // 데이터베이스 스키마와 일치
  store_info?: string; // 데이터베이스 스키마와 일치
  
  ratings: {
    aroma: number;
    flavor: number;
    acidity: number;
    sweetness: number;
    body: number;
    aftertaste: number;
    balance: number;
    overall: number;
  };
  
  notes?: string;
  extracted_text?: string; // 데이터베이스 스키마와 일치
  image_url?: string;      // 데이터베이스 스키마와 일치
}

export interface ExtractedCoffeeData {
  country?: string;
  farm?: string;
  region?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  cupNotes?: string;
  storeInfo?: string;
  title?: string;
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