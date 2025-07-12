'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { DEFAULT_RATINGS, RATING_CATEGORIES, COFFEE_COUNTRIES, COFFEE_VARIETIES, PROCESSING_METHODS, COFFEE_REGIONS, COFFEE_FARMS } from '@/constants/defaults';
import AutoCompleteInput from '@/components/ui/AutoCompleteInput';
import { 
  matchCountry, 
  matchVariety, 
  matchProcessingMethod,
  matchRegion,
  matchFarm,
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
    date: new Date().toISOString().slice(0, 16), // 현재 날짜와 시간 (YYYY-MM-DDTHH:mm)
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
    farm?: MatchResult;
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
    setFormData(prev => ({ ...prev, country: value, region: '', farm: '' })); // 국가 변경시 지역, 농장 초기화
  }, []);

  const handleCountryMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, country: match || undefined }));
    // 국가 매칭이 변경되면 지역, 농장도 초기화
    if (match) {
      setFormData(prev => ({ ...prev, region: '', farm: '' }));
    }
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
    setFormData(prev => ({ ...prev, region: value, farm: '' })); // 지역 변경시 농장 초기화
  }, []);

  const handleRegionMatch = useCallback((match: MatchResult | null) => {
    console.log('🌍 지역 매칭 변경:', match?.name);
    setMatchedData(prev => ({ ...prev, region: match || undefined }));
    // 지역 매칭이 변경되면 농장도 초기화
    if (match) {
      console.log('🌍 농장 필드 초기화');
      setFormData(prev => ({ ...prev, farm: '' }));
    }
  }, []);

  const handleFarmChange = useCallback((value: string) => {
    console.log('handleFarmChange called with:', value);
    setFormData(prev => ({ ...prev, farm: value }));
  }, []);

  const handleFarmMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, farm: match || undefined }));
  }, []);

  // 농장 suggestions 단순화
  const farmSuggestions = useMemo(() => {
    console.log('🔄 farmSuggestions 재계산 중...');
    console.log('🔄 지역 이름:', matchedData.region?.name);
    
    if (!matchedData.region?.name) {
      console.log('🔄 지역 없음 - 빈 배열 반환');
      return [];
    }
    
    const farms = (COFFEE_FARMS as any)[matchedData.region.name];
    console.log('🔄 찾은 농장들:', farms);
    
    if (!farms || !Array.isArray(farms)) {
      console.log('🔄 농장 데이터 없음 - 빈 배열 반환');
      return [];
    }
    
    const result = farms.map((farm: string) => ({
      id: farm.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: farm,
      englishName: farm
    }));
    
    console.log('🔄 최종 suggestions:', result);
    return result;
  }, [matchedData.region?.name]);

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
    <div className="space-y-8">
      {/* Form 바깥 테스트 영역 */}
      <div className="bg-red-100 p-4 border-2 border-red-500 rounded">
        <h3 className="font-bold text-red-700 mb-2">🚨 FORM 바깥 테스트 영역</h3>
        <select
          value={formData.farm}
          onChange={(e) => {
            console.log('🚨 OUTSIDE FORM SELECT:', e.target.value);
            alert('Form 바깥 선택: ' + e.target.value);
            setFormData(prev => ({ ...prev, farm: e.target.value }));
          }}
          className="w-full px-4 py-2 border border-red-500 rounded"
        >
          <option value="">테스트용 농장 선택</option>
          <option value="테스트농장1">테스트농장1</option>
          <option value="테스트농장2">테스트농장2</option>
          <option value="테스트농장3">테스트농장3</option>
        </select>
        <div className="mt-2 text-sm">현재 값: {formData.farm}</div>
      </div>
      
    <form id="tasting-note-form" onSubmit={handleSubmit} className="space-y-8">
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
            dropdownHeader="🌍 추천 국가:"
          />
          
          <AutoCompleteInput
            label={`지역${matchedData.country ? ` (${matchedData.country.name})` : ''}`}
            name="region"
            value={formData.region}
            onChange={handleRegionChange}
            onMatch={handleRegionMatch}
            placeholder={
              matchedData.country?.id && (COFFEE_REGIONS as any)[matchedData.country.id]?.length > 0
                ? `${matchedData.country.name}의 주요 산지 또는 직접 입력...`
                : matchedData.country
                ? "지역을 직접 입력해주세요..."
                : "먼저 국가를 선택해주세요..."
            }
            matcher={(input) => matchRegion(input, matchedData.country?.id)}
            suggestions={matchedData.country?.id ? 
              (COFFEE_REGIONS as any)[matchedData.country.id]?.map((region: string) => ({
                id: region.toLowerCase().replace(/\s+/g, '_'),
                name: region,
                englishName: region
              })) || [] : []}
            dropdownHeader={
              matchedData.country?.id && (COFFEE_REGIONS as any)[matchedData.country.id]?.length > 0
                ? `🏔️ ${matchedData.country.name} 주요 산지:`
                : matchedData.country
                ? "📝 직접 입력 가능:"
                : "🌍 먼저 국가를 선택하세요"
            }
          />
          
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              농장{matchedData.region ? ` (${matchedData.region.name})` : ''}
            </label>
            
            {/* 디버깅용 상태 표시 */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs space-y-1">
              <div><strong>🔍 농장 필드 디버깅:</strong></div>
              <div>현재 농장 값: <strong>&ldquo;{formData.farm}&rdquo;</strong></div>
              <div>농장 값 길이: {formData.farm.length}</div>
              <div>지역 매칭: {matchedData.region?.name || '미선택'}</div>
              <div>농장 suggestions: {farmSuggestions.length}개</div>
              <div>지역 ID: {matchedData.region?.id || '없음'}</div>
              <div>렌더링 시간: {new Date().toLocaleTimeString()}</div>
              <div>농장 suggestions 목록: {farmSuggestions.map(f => f.name).join(', ')}</div>
            </div>

            {farmSuggestions.length > 0 ? (
              <div className="space-y-2">
                {/* UNCONTROLLED SELECT 테스트 */}
                <select
                  defaultValue={formData.farm}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('🔥 UNCONTROLLED FARM SELECT EVENT TRIGGERED');
                    console.log('🔥 Selected value:', newValue);
                    
                    setFormData(prev => {
                      const updated = { ...prev, farm: newValue };
                      console.log('🔥 State update - new farm value:', updated.farm);
                      return updated;
                    });
                  }}
                  onClick={() => console.log('🔥 FARM SELECT CLICKED')}
                  onFocus={() => console.log('🔥 FARM SELECT FOCUSED')}
                  onBlur={() => console.log('🔥 FARM SELECT BLURRED')}
                  onMouseDown={() => console.log('🔥 FARM SELECT MOUSE DOWN')}
                  onMouseUp={() => console.log('🔥 FARM SELECT MOUSE UP')}
                  className="w-full px-4 py-2 border-2 border-red-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-red-50"
                >
                  <option value="">🏡 농장을 선택하세요</option>
                  {farmSuggestions.map((farm) => (
                    <option 
                      key={farm.id} 
                      value={farm.name}
                      onClick={() => console.log('🔥 OPTION CLICKED:', farm.name)}
                    >
                      {farm.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-red-600 font-bold">
                  🔴 UNCONTROLLED SELECT 테스트 - {farmSuggestions.length}개의 {matchedData.region?.name} 농장
                </div>
                
                {/* CONTROLLED SELECT (ORIGINAL) */}
                <select
                  value={formData.farm}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    console.log('🔥 CONTROLLED FARM SELECT EVENT TRIGGERED');
                    console.log('🔥 Selected value:', newValue);
                    
                    setFormData(prev => {
                      const updated = { ...prev, farm: newValue };
                      console.log('🔥 State update - new farm value:', updated.farm);
                      return updated;
                    });
                  }}
                  onClick={() => console.log('🔥 CONTROLLED SELECT CLICKED')}
                  onFocus={() => console.log('🔥 CONTROLLED SELECT FOCUSED')}
                  onBlur={() => console.log('🔥 CONTROLLED SELECT BLURRED')}
                  className="w-full px-4 py-2 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-blue-50"
                >
                  <option value="">🏡 CONTROLLED - 농장을 선택하세요</option>
                  {farmSuggestions.map((farm) => (
                    <option 
                      key={farm.id} 
                      value={farm.name}
                      onClick={() => console.log('🔥 CONTROLLED OPTION CLICKED:', farm.name)}
                    >
                      {farm.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-blue-600 font-bold">
                  🔵 CONTROLLED SELECT (기존) - 현재 값: {formData.farm}
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    console.log('🔥 TEST BUTTON CLICKED');
                    setFormData(prev => ({ ...prev, farm: 'TEST FARM' }));
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                >
                  테스트 버튼 (농장 값 강제 변경)
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={formData.farm}
                  onChange={(e) => {
                    console.log('🔥 FARM INPUT CHANGED:', e.target.value);
                    setFormData(prev => ({ ...prev, farm: e.target.value }));
                  }}
                  placeholder="농장을 직접 입력하세요"
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="text-xs text-stone-500">
                  지역을 먼저 선택하면 농장 목록을 볼 수 있습니다
                </div>
              </div>
            )}
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
            dropdownHeader="🌱 추천 품종:"
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
            dropdownHeader="⚙️ 추천 가공 방법:"
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
              날짜 및 시간
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Spacer for floating button */}
      <div className="h-20"></div>
    </form>
    </div>
  );
});

export default TastingNoteForm;