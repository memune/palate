export interface TastingNote {
  id: string;
  title: string;
  date: string;
  imageUrl?: string;
  extractedText?: string;
  
  // Coffee Information
  country?: string;          // 국가
  farm?: string;            // 농장
  region?: string;          // 지역(동네)
  variety?: string;         // 품종
  altitude?: string;        // 고도
  process?: string;         // 프로세싱 방법
  cupNotes?: string;        // 컵노트
  storeInfo?: string;       // 매장 정보
  
  // Legacy fields (keeping for backward compatibility)
  origin?: string;
  roastLevel?: string;
  brewery?: string;
  
  ratings: {
    aroma: number;
    acidity: number;
    sweetness: number;
    body: number;
    flavor: number;
    aftertaste: number;
  };
  notes?: string;
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