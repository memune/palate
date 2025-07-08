'use client';

import { useState, useEffect } from 'react';
import { TastingNote, ExtractedCoffeeData } from '@/types';
import RatingSlider from '@/components/rating/RatingSlider';
import { extractCoffeeDataFromText } from '@/utils/coffeeDataExtractor';

interface TastingFormProps {
  extractedText?: string;
  onSubmit: (note: Partial<TastingNote>) => void;
}

export default function TastingForm({ extractedText, onSubmit }: TastingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    notes: extractedText || '',
    
    // New coffee fields
    country: '',
    farm: '',
    region: '',
    variety: '',
    altitude: '',
    process: '',
    cupNotes: '',
    storeInfo: '',
    
    // Legacy fields
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

  const [isExtracting, setIsExtracting] = useState(false);

  // OCR 텍스트에서 자동으로 필드 추출
  useEffect(() => {
    if (extractedText && extractedText.trim()) {
      setIsExtracting(true);
      extractCoffeeDataFromText(extractedText)
        .then((extractedData: ExtractedCoffeeData) => {
          setFormData(prev => ({
            ...prev,
            title: extractedData.title || prev.title,
            country: extractedData.country || prev.country,
            farm: extractedData.farm || prev.farm,
            region: extractedData.region || prev.region,
            variety: extractedData.variety || prev.variety,
            altitude: extractedData.altitude || prev.altitude,
            process: extractedData.process || prev.process,
            cupNotes: extractedData.cupNotes || prev.cupNotes,
            storeInfo: extractedData.storeInfo || prev.storeInfo,
          }));
        })
        .catch(error => {
          console.error('자동 필드 추출 실패:', error);
        })
        .finally(() => {
          setIsExtracting(false);
        });
    }
  }, [extractedText]);

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
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">테이스팅 노트 작성</h2>
      
      {isExtracting && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-blue-700">🤖 AI가 커피 정보를 자동으로 추출하고 있습니다...</span>
          </div>
        </div>
      )}
      
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
            placeholder="커피 이름을 입력하세요"
          />
        </div>

        {/* 커피 기본 정보 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">☕ 커피 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                국가
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 에티오피아"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                농장
              </label>
              <input
                type="text"
                value={formData.farm}
                onChange={(e) => setFormData(prev => ({ ...prev, farm: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="농장명"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지역
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 예가체프"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                품종
              </label>
              <input
                type="text"
                value={formData.variety}
                onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 게이샤"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                고도
              </label>
              <input
                type="text"
                value={formData.altitude}
                onChange={(e) => setFormData(prev => ({ ...prev, altitude: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 1800m"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로세싱
              </label>
              <input
                type="text"
                value={formData.process}
                onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: 워시드"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                매장 정보
              </label>
              <input
                type="text"
                value={formData.storeInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, storeInfo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="로스터리, 카페명 등"
              />
            </div>
          </div>
        </div>

        {/* 컵노트 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            컵노트 (맛 특성)
          </label>
          <textarea
            value={formData.cupNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, cupNotes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 플로럴, 자스민, 베르가못, 초콜릿..."
          />
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