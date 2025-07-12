'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { DEFAULT_RATINGS, RATING_CATEGORIES } from '@/constants/defaults';

interface TastingNoteFormData {
  title: string;
  date: string;
  country: string;
  farm: string;
  region: string;
  variety: string;
  altitude: string;
  process: string;
  cup_notes: string;
  store_info: string;
  ratings: typeof DEFAULT_RATINGS;
  notes: string;
}

interface TastingNoteFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TastingNoteFormData>;
  onSubmit: (data: TastingNoteFormData) => Promise<void>;
  loading?: boolean;
  submitButtonText?: string;
}

const TastingNoteForm = memo(function TastingNoteForm({ 
  mode, 
  initialData, 
  onSubmit, 
  loading = false,
  submitButtonText 
}: TastingNoteFormProps) {
  const [formData, setFormData] = useState<TastingNoteFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    country: '',
    farm: '',
    region: '',
    variety: '',
    altitude: '',
    process: '',
    cup_notes: '',
    store_info: '',
    ratings: DEFAULT_RATINGS,
    notes: '',
    ...initialData,
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleRatingChange = useCallback((category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    await onSubmit(formData);
  }, [formData, onSubmit]);

  const getSubmitButtonText = useCallback(() => {
    if (submitButtonText) return submitButtonText;
    if (loading) return mode === 'create' ? '저장 중...' : '수정 중...';
    return mode === 'create' ? '테이스팅 노트 저장' : '테이스팅 노트 수정';
  }, [submitButtonText, loading, mode]);

  return (
    <form id="tasting-note-form" onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">기본 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 콜롬비아 우일라 더치 워시드"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              날짜
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Coffee Information */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">커피 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              국가
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 콜롬비아"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              농장
            </label>
            <input
              type="text"
              name="farm"
              value={formData.farm}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 라 에스페란자 농장"
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
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 우일라"
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
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 카투라"
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
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 1,500m"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              가공 방법
            </label>
            <input
              type="text"
              name="process"
              value={formData.process}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 더치 워시드"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            컵노트 (테이스팅 노트)
          </label>
          <input
            type="text"
            name="cup_notes"
            value={formData.cup_notes}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="예: 초콜릿, 견과류, 오렌지 산미"
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            매장 정보
          </label>
          <input
            type="text"
            name="store_info"
            value={formData.store_info}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="예: 블루보틀 강남점"
          />
        </div>
      </div>

      {/* Ratings */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">평가</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RATING_CATEGORIES.map((category) => (
            <div key={category.key}>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {category.label}
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.ratings[category.key as keyof typeof formData.ratings]}
                  onChange={(e) => handleRatingChange(category.key, parseInt(e.target.value))}
                  className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-lg font-semibold text-emerald-800 min-w-[3rem] text-center">
                  {formData.ratings[category.key as keyof typeof formData.ratings]}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
        <h2 className="text-lg font-semibold text-stone-900 mb-6">추가 노트</h2>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          placeholder="개인적인 감상이나 추가 메모를 입력하세요..."
        />
      </div>

      {/* Spacer for floating button */}
      <div className="h-20"></div>
    </form>
  );
});

export default TastingNoteForm;