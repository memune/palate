'use client';

import { SliderProps } from '@/types';
import Tooltip from '@/components/ui/Tooltip';

interface RatingSliderProps extends Omit<SliderProps, 'label'> {
  label: string;
  description?: string;
}

export default function RatingSlider({ 
  label, 
  description,
  value, 
  onChange, 
  min = 1, 
  max = 10, 
  step = 1 
}: RatingSliderProps) {
  const getRatingText = (rating: number) => {
    if (rating <= 2) return '아쉬워요';
    if (rating <= 4) return '보통 이하';
    if (rating <= 6) return '보통';
    if (rating <= 8) return '좋아요';
    return '훌륭해요';
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600';
    if (rating <= 4) return 'text-orange-600';
    if (rating <= 6) return 'text-yellow-600';
    if (rating <= 8) return 'text-green-600';
    return 'text-blue-600';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    
    // 햅틱 피드백 (모바일 디바이스에서만 작동)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // 10ms 아주 미세한 진동
    }
    
    onChange(newValue);
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {description && (
            <Tooltip content={description} position="top">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-emerald-800">
            {value}점
          </div>
          <div className={`text-xs ${getRatingColor(value)}`}>
            {getRatingText(value)}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1 (최저)</span>
          <span>5 (보통)</span>
          <span>10 (최고)</span>
        </div>
      </div>
      
      <style jsx>{`
        .slider {
          background: linear-gradient(to right, #ef4444 0%, #f97316 25%, #eab308 50%, #22c55e 75%, #3b82f6 100%);
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid #065f46;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: 3px solid #065f46;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}