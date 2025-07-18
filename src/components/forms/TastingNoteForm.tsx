'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { DEFAULT_RATINGS, RATING_CATEGORIES, RATING_GUIDES, COFFEE_COUNTRIES, COFFEE_VARIETIES, PROCESSING_METHODS, COFFEE_REGIONS, COFFEE_FARMS, CUP_NOTE_CATEGORIES } from '@/constants/defaults';
import AutoCompleteInput from '@/components/ui/AutoCompleteInput';
import { CupNoteTagSelector } from '@/components/ui/TagChip';
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
  altitude: string; // 백엔드 호환성을 위해 유지, 내부적으로 구조화
  process: string;
  cup_notes: string;
  store_info: string;
  ratings: typeof DEFAULT_RATINGS;
  notes: string;
}

interface AltitudeData {
  type: 'single' | 'range';
  single?: number;
  min?: number;
  max?: number;
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
  
  // 고도 관리
  const [altitudeData, setAltitudeData] = useState<AltitudeData>({ type: 'single' });
  
  // 컵노트 태그 관리
  const [selectedCupNoteTags, setSelectedCupNoteTags] = useState<string[]>([]);
  
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
  
  // 고도 데이터를 formData.altitude에 동기화
  useEffect(() => {
    let altitudeString = '';
    if (altitudeData.type === 'single' && altitudeData.single) {
      altitudeString = `${altitudeData.single}m`;
    } else if (altitudeData.type === 'range' && altitudeData.min && altitudeData.max) {
      altitudeString = `${altitudeData.min}-${altitudeData.max}m`;
    }
    
    if (formData.altitude !== altitudeString) {
      setFormData(prev => ({ ...prev, altitude: altitudeString }));
    }
  }, [altitudeData, formData.altitude]);
  
  // 초기 데이터를 altitudeData로 파싱 (edit 모드용)
  useEffect(() => {
    if (initialData?.altitude && formData.altitude && !altitudeData.single && !altitudeData.min) {
      const altStr = formData.altitude;
      if (altStr.includes('-')) {
        // 범위 고도 파싱
        const match = altStr.match(/(\d+)-(\d+)/);
        if (match) {
          setAltitudeData({
            type: 'range',
            min: parseInt(match[1]),
            max: parseInt(match[2])
          });
        }
      } else {
        // 단일 고도 파싱
        const match = altStr.match(/(\d+)/);
        if (match) {
          setAltitudeData({
            type: 'single',
            single: parseInt(match[1])
          });
        }
      }
    }
  }, [initialData?.altitude, formData.altitude, altitudeData.single, altitudeData.min]);
  
  // 컵노트 태그를 formData.cup_notes와 동기화
  useEffect(() => {
    const cupNotesString = selectedCupNoteTags.join(', ');
    if (formData.cup_notes !== cupNotesString) {
      setFormData(prev => ({ ...prev, cup_notes: cupNotesString }));
    }
  }, [selectedCupNoteTags, formData.cup_notes]);
  
  // 초기 데이터의 cup_notes를 태그로 파싱 (edit 모드용)
  useEffect(() => {
    if (initialData?.cup_notes && formData.cup_notes && selectedCupNoteTags.length === 0) {
      const tags = formData.cup_notes
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      setSelectedCupNoteTags(tags);
    }
  }, [initialData?.cup_notes, formData.cup_notes, selectedCupNoteTags.length]);

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
    <div className="max-w-4xl mx-auto p-4 space-y-8">
    <form id="tasting-note-form" onSubmit={handleSubmit} className="space-y-8">

      {/* Coffee Information - No Box */}
      <div className="space-y-8">
          {/* Location Fields */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
              Origin
            </h2>
            <div className="grid grid-cols-1 gap-4">
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
              
              <AutoCompleteInput
                key={`farm-autocomplete-${selectedRegionForFarm || 'no-region'}`}
                label={`농장${selectedRegionForFarm ? ` (${selectedRegionForFarm})` : ''}`}
                name="farm"
                value={formData.farm}
                onChange={handleFarmChange}
                onMatch={handleFarmMatch}
                placeholder={
                  farmSuggestions.length > 0
                    ? `${selectedRegionForFarm}의 주요 농장 또는 직접 입력...`
                    : formData.region
                    ? "농장을 직접 입력해주세요..."
                    : "먼저 지역을 선택해주세요..."
                }
                matcher={(input) => matchFarm(input, selectedRegionForFarm)}
                suggestions={farmSuggestions}
                dropdownHeader={
                  farmSuggestions.length > 0
                    ? `🏡 ${selectedRegionForFarm} 주요 농장:`
                    : formData.region
                    ? "📝 직접 입력 가능:"
                    : "🌍 먼저 지역을 선택하세요"
                }
              />
            </div>
          </div>

          {/* Coffee Characteristics */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
              Characteristics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Altitude Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
              Altitude
            </h2>
            <div className="space-y-4">
              {/* 고도 타입 선택 */}
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="altitudeType"
                    value="single"
                    checked={altitudeData.type === 'single'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAltitudeData({ type: 'single' });
                      }
                    }}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">단일 고도</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="altitudeType"
                    value="range"
                    checked={altitudeData.type === 'range'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAltitudeData({ type: 'range' });
                      }
                    }}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">범위 고도</span>
                </label>
              </div>
              
              {/* 조건부 입력 필드 */}
              {altitudeData.type === 'single' ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={altitudeData.single || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      setAltitudeData(prev => ({ ...prev, single: value }));
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="1500"
                    min="0"
                    max="5000"
                  />
                  <span className="text-sm text-gray-500 font-medium">m</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={altitudeData.min || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        setAltitudeData(prev => ({ ...prev, min: value }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="1200"
                      min="0"
                      max="5000"
                    />
                    <span className="text-xs text-gray-500">m</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">~</span>
                    <input
                      type="number"
                      value={altitudeData.max || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        setAltitudeData(prev => ({ ...prev, max: value }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="1800"
                      min="0"
                      max="5000"
                    />
                    <span className="text-xs text-gray-500">m</span>
                  </div>
                </div>
              )}
              
              {/* 미리보기 */}
              {formData.altitude && (
                <div className="text-xs text-gray-500 italic">
                  저장될 값: <span className="font-medium text-gray-700">{formData.altitude}</span>
                </div>
              )}
            </div>
          </div>

          {/* Store Info */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
              Store
            </h2>
            <input
              type="text"
              name="store_info"
              value={formData.store_info}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="예: 블루보틀 강남점"
            />
          </div>
        </div>

        {/* Cup Notes Section - Full Width */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
            Tasting Notes
          </h2>
          <CupNoteTagSelector
            selectedTags={selectedCupNoteTags}
            onTagsChange={setSelectedCupNoteTags}
            categories={CUP_NOTE_CATEGORIES}
            maxTags={20}
          />
        </div>

      {/* Ratings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2 brand-font">
          Rating
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {RATING_CATEGORIES.map((category) => {
            const guide = RATING_GUIDES[category.key as keyof typeof RATING_GUIDES];
            return (
              <div key={category.key} className="space-y-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-900">
                    {category.label}
                  </label>
                  <div className="group relative">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={`${category.label} 도움말`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64">
                      <div className="font-medium mb-1">{guide.title}</div>
                      <div className="mb-2">{guide.description}</div>
                      <div className="text-gray-300 text-xs">
                        <strong>테이스팅 방법:</strong> {guide.howToTaste}
                      </div>
                      <div className="text-gray-300 text-xs mt-1">
                        <strong>팁:</strong> {guide.tips}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
                
                {/* 점수 선택 버튼들 */}
                <div className="grid grid-cols-10 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleRatingChange(category.key, score)}
                      className={`
                        aspect-square flex items-center justify-center text-xs font-medium rounded transition-all
                        ${formData.ratings[category.key as keyof typeof formData.ratings] >= score
                          ? 'bg-emerald-800 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }
                      `}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
          Notes
        </h2>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
          placeholder="개인적인 감상이나 추가 메모를 입력하세요..."
        />
      </div>

      {/* Basic Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2 brand-font">
          Details
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 
              <span className="text-xs text-gray-500 ml-2">(선택사항 - 자동 생성됨)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="커피 정보 입력시 자동 생성됩니다"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              날짜 및 시간
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom on mobile */}
      <div className="sticky bottom-4 z-10">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
        >
          {getSubmitButtonText()}
        </button>
      </div>

      {/* Spacer for floating button */}
      <div className="h-4"></div>
    </form>
    </div>
  );
});

export default TastingNoteForm;