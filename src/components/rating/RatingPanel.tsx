'use client';

import { useState } from 'react';
import RatingSlider from './RatingSlider';
import { TastingNote } from '@/types';

interface RatingPanelProps {
  ratings: TastingNote['ratings'];
  onChange: (ratings: TastingNote['ratings']) => void;
}

const ratingLabels = {
  aroma: '향 (Aroma)',
  acidity: '산미 (Acidity)',
  sweetness: '단맛 (Sweetness)',
  body: '바디 (Body)',
  flavor: '풍미 (Flavor)',
  aftertaste: '여운 (Aftertaste)'
};

export default function RatingPanel({ ratings, onChange }: RatingPanelProps) {
  const handleRatingChange = (key: keyof TastingNote['ratings'], value: number) => {
    onChange({
      ...ratings,
      [key]: value
    });
  };

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">테이스팅 평가</h3>
      
      {Object.entries(ratingLabels).map(([key, label]) => (
        <RatingSlider
          key={key}
          label={label}
          value={ratings[key as keyof TastingNote['ratings']]}
          onChange={(value) => handleRatingChange(key as keyof TastingNote['ratings'], value)}
        />
      ))}
      
      <div className="mt-6 p-3 bg-white rounded-lg border border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">평가 요약</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(ratingLabels).map(([key, label]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600">{label}:</span>
              <span className="font-semibold">{ratings[key as keyof TastingNote['ratings']]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}