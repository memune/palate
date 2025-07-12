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
    setMatchedData(prev => ({ ...prev, region: match || undefined }));
    // 지역 매칭이 변경되어도 농장은 formData.region 변경으로 따로 처리됨
  }, []);

  const handleFarmChange = useCallback((value: string) => {
    console.log('handleFarmChange called with:', value);
    setFormData(prev => ({ ...prev, farm: value }));
  }, []);

  const handleFarmMatch = useCallback((match: MatchResult | null) => {
    setMatchedData(prev => ({ ...prev, farm: match || undefined }));
  }, []);

  // 농장 suggestions - 지역과 독립적으로 관리
  const [selectedRegionForFarm, setSelectedRegionForFarm] = useState<string>('');
  const [farmSuggestions, setFarmSuggestions] = useState<{ id: string; name: string; englishName: string }[]>([]);
  
  // 지역이 변경될 때만 농장 업데이트 (국가와 무관)
  useEffect(() => {
    const regionName = formData.region;
    if (!regionName) {
      setFarmSuggestions([]);
      setSelectedRegionForFarm('');
      return;
    }
    
    // 지역명이 변경되었을 때만 농장 목록 업데이트
    if (regionName !== selectedRegionForFarm) {
      setSelectedRegionForFarm(regionName);
      
      const farms = (COFFEE_FARMS as any)[regionName];
      if (farms && Array.isArray(farms)) {
        const farmOptions = farms.map((farm: string) => ({
          id: farm.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: farm,
          englishName: farm
        }));
        setFarmSuggestions(farmOptions);
      } else {
        setFarmSuggestions([]);
      }
      
      // 지역이 바뀌면 농장 초기화
      setFormData(prev => ({ ...prev, farm: '' }));
    }
  }, [formData.region, selectedRegionForFarm]);

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
      {/* FORM 바깥 테스트 */}
      <div className="bg-green-100 p-4 border border-green-400 rounded">
        <h3 className="font-bold text-green-800 mb-2">🌍 FORM 바깥 테스트</h3>
        <input
          type="text"
          onChange={(e) => {
            console.log('🌍 FORM 바깥 onChange:', e.target.value);
            alert('FORM 바깥 onChange: ' + e.target.value);
          }}
          className="w-full px-2 py-1 border border-green-400 rounded"
          placeholder="Form 밖부에서 onChange 테스트"
        />
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
          
          <div className="space-y-4">
            {/* 진단용 디버깅 영역 */}
            <div className="bg-yellow-100 p-4 border border-yellow-400 rounded">
              <h3 className="font-bold text-yellow-800 mb-2">🔍 진단: 어떤 요소가 onChange를 차단하나?</h3>
              
              {/* 기본 input - alert 없이 */}
              <div className="mb-3">
                <label className="text-sm font-bold text-yellow-800">기본 INPUT (alert 없음)</label>
                <input
                  type="text"
                  defaultValue=""
                  onChange={(e) => {
                    console.log('🔴 onChange 작동:', e.target.value);
                  }}
                  className="w-full px-2 py-1 border border-yellow-400 rounded"
                  placeholder="기본 input 테스트 (alert 없음)"
                />
                <div className="text-xs text-yellow-700 mt-1">
                  콘솔에서 onChange 로그 확인하세요 (alert 대신)
                </div>
              </div>
              
              
              {/* 2. AutoCompleteInput 기본 */}
              <div className="mb-3">
                <AutoCompleteInput
                  label="2. AutoCompleteInput (기본)"
                  name="farm-test-basic"
                  value={formData.farm}
                  onChange={(value) => {
                    console.log('🔵 AutoComplete 기본 onChange:', value);
                    setFormData(prev => ({ ...prev, farm: value }));
                  }}
                  placeholder="AutoComplete 기본 테스트"
                  matcher={() => null}
                  suggestions={[]}
                />
              </div>
              
              {/* 3. AutoCompleteInput uncontrolled */}
              <div className="mb-3">
                <AutoCompleteInput
                  label="3. AutoCompleteInput (uncontrolled)"
                  name="farm-test-uncontrolled"
                  defaultValue={formData.farm}
                  uncontrolled={true}
                  onChange={(value) => {
                    console.log('🟢 AutoComplete uncontrolled onChange:', value);
                    setFormData(prev => ({ ...prev, farm: value }));
                  }}
                  placeholder="AutoComplete uncontrolled 테스트"
                  matcher={() => null}
                  suggestions={[]}
                />
              </div>
              
              {/* 4. AutoCompleteInput 전체 옵션 */}
              <div className="mb-3">
                <AutoCompleteInput
                  label="4. AutoCompleteInput (전체 옵션)"
                  name="farm-test-full"
                  defaultValue={formData.farm}
                  uncontrolled={true}
                  onChange={(value) => {
                    console.log('🟡 AutoComplete 전체 onChange:', value);
                    setFormData(prev => ({ ...prev, farm: value }));
                  }}
                  onMatch={(match) => {
                    console.log('🟡 AutoComplete 전체 onMatch:', match);
                  }}
                  placeholder="AutoComplete 전체 테스트"
                  matcher={(input) => matchFarm(input, matchedData.region?.name)}
                  suggestions={farmSuggestions}
                  dropdownHeader="테스트 드롭다운"
                />
              </div>
              
              <div className="text-xs text-yellow-700">
                현재 농장 값: <strong>{formData.farm}</strong><br/>
                렌더링 시간: {new Date().toLocaleTimeString()}<br/>
                <button 
                  onClick={() => {
                    console.log('🔥 버튼 클릭 테스트');
                    alert('버튼 클릭 작동!');
                    setFormData(prev => ({ ...prev, farm: 'BUTTON TEST' }));
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  버튼 테스트
                </button>
              </div>
            </div>
            
            {/* 기존 작동하는 select */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                농장 (작동하는 select)
              </label>
              <select
                key={`farm-select-${matchedData.region?.name || 'no-region'}`}
                defaultValue={formData.farm}
                onChange={(e) => {
                  console.log('🟢 작동하는 SELECT onChange:', e.target.value);
                  setFormData(prev => ({ ...prev, farm: e.target.value }));
                }}
                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">🏡 농장을 선택하세요</option>
                {farmSuggestions.map((farm) => (
                  <option key={farm.id} value={farm.name}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>
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