'use client';

import { useState } from 'react';
import { TastingNote } from '@/types';
import RatingSlider from '@/components/rating/RatingSlider';

interface TastingFormProps {
  extractedText?: string;
  onSubmit: (note: Partial<TastingNote>) => void;
}

export default function TastingForm({ extractedText, onSubmit }: TastingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: extractedText || '',
    origin: '',
    roastLevel: '',
    brewery: '',
    ratings: {
      aroma: 5,
      acidity: 5,
      sweetness: 5,
      body: 5,
      flavor: 5,
      aftertaste: 5,
    }
  });

  const handleRatingChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [key]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">테이스팅 노트 작성</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="테이스팅 노트 제목을 입력하세요"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              원산지
            </label>
            <input
              type="text"
              value={formData.origin}
              onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="예: 에티오피아"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              로스팅 정도
            </label>
            <select
              value={formData.roastLevel}
              onChange={(e) => setFormData(prev => ({ ...prev, roastLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              <option value="light">라이트 로스팅</option>
              <option value="medium">미디엄 로스팅</option>
              <option value="dark">다크 로스팅</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              브루어리/로스터리
            </label>
            <input
              type="text"
              value={formData.brewery}
              onChange={(e) => setFormData(prev => ({ ...prev, brewery: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="브루어리 이름"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">맛 평가</h3>
          <div className="space-y-4">
            <RatingSlider
              label="향 (Aroma)"
              value={formData.ratings.aroma}
              onChange={(value) => handleRatingChange('aroma', value)}
            />
            <RatingSlider
              label="산미 (Acidity)"
              value={formData.ratings.acidity}
              onChange={(value) => handleRatingChange('acidity', value)}
            />
            <RatingSlider
              label="단맛 (Sweetness)"
              value={formData.ratings.sweetness}
              onChange={(value) => handleRatingChange('sweetness', value)}
            />
            <RatingSlider
              label="바디 (Body)"
              value={formData.ratings.body}
              onChange={(value) => handleRatingChange('body', value)}
            />
            <RatingSlider
              label="풍미 (Flavor)"
              value={formData.ratings.flavor}
              onChange={(value) => handleRatingChange('flavor', value)}
            />
            <RatingSlider
              label="여운 (Aftertaste)"
              value={formData.ratings.aftertaste}
              onChange={(value) => handleRatingChange('aftertaste', value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            메모
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="테이스팅 노트를 작성하세요..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          테이스팅 노트 저장
        </button>
      </div>
    </form>
  );
}