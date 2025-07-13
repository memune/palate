'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface OptimizedTastingNoteFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  mode?: 'create' | 'edit';
  initialData?: any;
}

export default function OptimizedTastingNoteForm({ 
  onSubmit, 
  loading = false,
  mode = 'create',
  initialData 
}: OptimizedTastingNoteFormProps) {
  const { user } = useAuth();

  // 단순한 상태 관리
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    country: initialData?.country || '',
    region: initialData?.region || '',
    farm: initialData?.farm || '',
    variety: initialData?.variety || '',
    process: initialData?.process || '',
    altitude: initialData?.altitude || '',
    cup_notes: initialData?.cup_notes || '',
    notes: initialData?.notes || '',
    // 평점 시스템
    overall: initialData?.ratings?.overall || 0,
    aroma: initialData?.ratings?.aroma || 0,
    flavor: initialData?.ratings?.flavor || 0,
    aftertaste: initialData?.ratings?.aftertaste || 0,
    acidity: initialData?.ratings?.acidity || 0,
    body: initialData?.ratings?.body || 0,
    balance: initialData?.ratings?.balance || 0,
    sweetness: initialData?.ratings?.sweetness || 0,
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRatingChange = useCallback((category: string, value: number) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 데이터 구조화
    const submitData = {
      title: formData.title.trim() || '새 테이스팅 노트',
      country: formData.country.trim() || null,
      region: formData.region.trim() || null,
      farm: formData.farm.trim() || null,
      variety: formData.variety.trim() || null,
      process: formData.process.trim() || null,
      altitude: formData.altitude.trim() || null,
      cup_notes: formData.cup_notes.trim() || null,
      notes: formData.notes.trim() || null,
      ratings: {
        overall: formData.overall,
        aroma: formData.aroma,
        flavor: formData.flavor,
        aftertaste: formData.aftertaste,
        acidity: formData.acidity,
        body: formData.body,
        balance: formData.balance,
        sweetness: formData.sweetness,
      }
    };

    await onSubmit(submitData);
  }, [formData, onSubmit]);

  const RatingInput = ({ label, category, value }: { label: string; category: string; value: number }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={value}
          onChange={(e) => handleRatingChange(category, parseFloat(e.target.value))}
          className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer slider"
          disabled={loading}
        />
        <span className="w-8 text-sm font-medium text-stone-600 text-center">
          {value}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-xl font-light text-stone-900 mb-6 border-b border-stone-200 pb-3 brand-font">
          Basic Information
        </h2>
        
        <div className="space-y-6">
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="예: 에티오피아 예가체프 G1"
              disabled={loading}
              required
            />
          </div>

          {/* 원산지 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                원산지
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 에티오피아"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                지역
              </label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 예가체프"
                disabled={loading}
              />
            </div>
          </div>

          {/* 농장 & 품종 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                농장
              </label>
              <input
                type="text"
                name="farm"
                value={formData.farm}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 워카 농장"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                품종
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 헤이룸"
                disabled={loading}
              />
            </div>
          </div>

          {/* 가공 & 고도 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                가공 방법
              </label>
              <input
                type="text"
                name="process"
                value={formData.process}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 워시드"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                고도
              </label>
              <input
                type="text"
                name="altitude"
                value={formData.altitude}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 1800-2000m"
                disabled={loading}
              />
            </div>
          </div>

          {/* 컵 노트 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              컵 노트
            </label>
            <input
              type="text"
              name="cup_notes"
              value={formData.cup_notes}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
              placeholder="예: 블루베리, 초콜릿, 시트러스"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* 평점 시스템 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-xl font-light text-stone-900 mb-6 border-b border-stone-200 pb-3 brand-font">
          Ratings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RatingInput label="전체적인 인상" category="overall" value={formData.overall} />
          <RatingInput label="향미 (Aroma)" category="aroma" value={formData.aroma} />
          <RatingInput label="맛 (Flavor)" category="flavor" value={formData.flavor} />
          <RatingInput label="여운 (Aftertaste)" category="aftertaste" value={formData.aftertaste} />
          <RatingInput label="산미 (Acidity)" category="acidity" value={formData.acidity} />
          <RatingInput label="바디감 (Body)" category="body" value={formData.body} />
          <RatingInput label="균형감 (Balance)" category="balance" value={formData.balance} />
          <RatingInput label="단맛 (Sweetness)" category="sweetness" value={formData.sweetness} />
        </div>
      </div>

      {/* 개인 노트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-xl font-light text-stone-900 mb-6 border-b border-stone-200 pb-3 brand-font">
          Personal Notes
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">
            개인적인 기록
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors resize-none"
            placeholder="이 커피에 대한 개인적인 느낌, 기억하고 싶은 순간, 또는 특별한 경험을 자유롭게 기록해주세요..."
            disabled={loading}
          />
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="sticky bottom-4 z-10">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {loading ? '저장 중...' : mode === 'create' ? '테이스팅 노트 저장' : '테이스팅 노트 수정'}
        </button>
      </div>

      {/* 스타일링 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #065f46;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #065f46;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </form>
  );
}