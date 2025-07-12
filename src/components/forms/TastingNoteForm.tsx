'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { DEFAULT_RATINGS, RATING_CATEGORIES, COFFEE_COUNTRIES, COFFEE_VARIETIES, PROCESSING_METHODS, COFFEE_REGIONS } from '@/constants/defaults';
import AutoCompleteInput from '@/components/ui/AutoCompleteInput';
import { 
  matchCountry, 
  matchVariety, 
  matchProcessingMethod,
  matchRegion,
  MatchResult 
} from '@/lib/coffee-data-matcher';
import { generateUniqueTitleFromData } from '@/lib/title-generator';
import { useTastingNotes } from '@/hooks/useTastingNotesQuery';

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
  const { data: existingNotes = [] } = useTastingNotes();
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

  // 매칭된 값들을 저장하는 상태
  const [matchedData, setMatchedData] = useState<{
    country?: MatchResult;
    variety?: MatchResult;
    process?: MatchResult;
    region?: MatchResult;
  }>({});

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  // 자동 제목 생성 (국가, 지역, 농장 정보가 변경될 때)
  useEffect(() => {
    // 편집 모드이거나 사용자가 이미 제목을 입력한 경우 자동 생성하지 않음
    if (mode === 'edit' || (initialData?.title && formData.title !== '')) {
      return;
    }

    // 국가, 지역, 농장 중 하나라도 있으면 제목 자동 생성
    if (formData.country || formData.region || formData.farm) {
      const autoTitle = generateUniqueTitleFromData(
        {
          country: formData.country,
          region: formData.region,
          farm: formData.farm,
        },
        existingNotes
      );

      if (autoTitle && autoTitle !== formData.title) {
        setFormData(prev => ({
          ...prev,
          title: autoTitle
        }));
      }
    }
  }, [formData.country, formData.region, formData.farm, existingNotes, mode, initialData?.title, formData.title]);

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

  // AutoComplete 핸들러들
  const handleCountryChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  }, []);

  const handleCountryMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, country: match || undefined }));
  }, []);

  const handleVarietyChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, variety: value }));
  }, []);

  const handleVarietyMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, variety: match || undefined }));
  }, []);

  const handleProcessChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, process: value }));
  }, []);

  const handleProcessMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, process: match || undefined }));
  }, []);

  const handleRegionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, region: value }));
  }, []);

  const handleRegionMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, region: match || undefined }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 제목이 비어있으면 자동 생성 시도
    let finalData = { ...formData };
    if (!finalData.title.trim()) {
      const autoTitle = generateUniqueTitleFromData(
        {
          country: finalData.country,
          region: finalData.region,
          farm: finalData.farm,
        },
        existingNotes
      );
      
      if (autoTitle) {
        finalData.title = autoTitle;
      } else {
        // 자동 생성도 실패하면 기본 제목 사용
        finalData.title = '새 테이스팅 노트';
      }
    }
    
    await onSubmit(finalData);
  }, [formData, onSubmit, existingNotes]);

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
              제목 <span className="text-sm text-stone-500">(선택사항 - 자동 생성됨)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="커피 정보 입력시 자동 생성됩니다"
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
          <AutoCompleteInput
            label="국가"
            name="country"
            value={formData.country}
            onChange={handleCountryChange}
            onMatch={handleCountryMatch}
            placeholder="예: 콜롬비아, 브라질, 에티오피아..."
            matcher={matchCountry}
            suggestions={COFFEE_COUNTRIES}
          />
          
          <AutoCompleteInput
            label="지역"
            name="region"
            value={formData.region}
            onChange={handleRegionChange}
            onMatch={handleRegionMatch}
            placeholder="예: 우일라, 시다모, 안티구아..."
            matcher={(input) => matchRegion(input, matchedData.country?.id)}
            suggestions={matchedData.country?.id ? 
              (COFFEE_REGIONS as any)[matchedData.country.id]?.map((region: string) => ({
                id: region.toLowerCase().replace(/\s+/g, '_'),
                name: region,
                englishName: region
              })) || [] : []}
          />
          
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
          
          <AutoCompleteInput
            label="품종"
            name="variety"
            value={formData.variety}
            onChange={handleVarietyChange}
            onMatch={handleVarietyMatch}
            placeholder="예: 게이샤, 부르봉, 티피카..."
            matcher={matchVariety}
            suggestions={COFFEE_VARIETIES}
          />
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
          <AutoCompleteInput
            label="가공 방법"
            name="process"
            value={formData.process}
            onChange={handleProcessChange}
            onMatch={handleProcessMatch}
            placeholder="예: 워시드, 내추럴, 허니..."
            matcher={matchProcessingMethod}
            suggestions={PROCESSING_METHODS}
          />
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