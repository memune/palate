'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import AutoCompleteInput from '@/components/ui/AutoCompleteInput';
import { 
  matchCountry, 
  matchVariety, 
  matchProcessingMethod,
  matchRegion,
  matchFarm 
} from '@/lib/coffee-data-matcher';
import { 
  COFFEE_COUNTRIES,
  COFFEE_VARIETIES, 
  PROCESSING_METHODS,
  COFFEE_REGIONS,
  COFFEE_FARMS
} from '@/constants/defaults';

// 지역 데이터를 AutoComplete에 사용할 수 있도록 변환
const ALL_REGIONS = Object.values(COFFEE_REGIONS).flat().map(region => ({
  id: region.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  name: region,
  englishName: region
}));

// 농장 데이터를 AutoComplete에 사용할 수 있도록 변환
const ALL_FARMS = Object.values(COFFEE_FARMS).flat().map(farm => ({
  id: farm.toLowerCase().replace(/[^a-z0-9]/g, '_'),
  name: farm,
  englishName: farm
}));
import { generateUniqueTitleFromData } from '@/lib/title-generator';
import { useTastingNotes } from '@/hooks/useTastingNotesQuery';

// 컵 노트 태그들
const CUP_NOTE_TAGS = [
  'Floral', 'Fruity', 'Citrus', 'Berry', 'Stone Fruit',
  'Tropical', 'Chocolate', 'Caramel', 'Vanilla', 'Nuts',
  'Spices', 'Herbs', 'Sweet', 'Balanced', 'Clean',
  'Bright', 'Juicy', 'Complex', 'Smooth', 'Rich'
];

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
  const { data: existingNotes = [] } = useTastingNotes();

  // 향상된 상태 관리
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
    store_info: initialData?.store_info || '',
    date: initialData?.date || new Date().toISOString().slice(0, 16),
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

  // 매칭된 데이터 상태
  const [matchedData, setMatchedData] = useState({
    country: null as any,
    variety: null as any,
    process: null as any,
    region: null as any,
    farm: null as any,
  });

  // 고도 입력 방식 상태
  const [altitudeData, setAltitudeData] = useState({
    type: 'single' as 'single' | 'range',
    single: initialData?.altitude || '',
    rangeMin: '',
    rangeMax: '',
  });

  // 컵 노트 태그 상태
  const [selectedCupNoteTags, setSelectedCupNoteTags] = useState<string[]>([]);
  const [customCupNote, setCustomCupNote] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleRatingChange = useCallback((category: string, value: number) => {
    setFormData(prev => ({ ...prev, [category]: value }));
  }, []);

  // AutoComplete 핸들러들
  const handleCountryChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, country: value }));
  }, []);

  const handleCountryMatch = useCallback((match: any) => {
    setMatchedData(prev => ({ ...prev, country: match }));
  }, []);

  const handleVarietyChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, variety: value }));
  }, []);

  const handleVarietyMatch = useCallback((match: any) => {
    setMatchedData(prev => ({ ...prev, variety: match }));
  }, []);

  const handleProcessChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, process: value }));
  }, []);

  const handleProcessMatch = useCallback((match: any) => {
    setMatchedData(prev => ({ ...prev, process: match }));
  }, []);

  const handleRegionChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, region: value }));
  }, []);

  const handleRegionMatch = useCallback((match: any) => {
    setMatchedData(prev => ({ ...prev, region: match }));
  }, []);

  const handleFarmChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, farm: value }));
  }, []);

  const handleFarmMatch = useCallback((match: any) => {
    setMatchedData(prev => ({ ...prev, farm: match }));
  }, []);

  // 고도 처리
  const handleAltitudeTypeChange = useCallback((type: 'single' | 'range') => {
    setAltitudeData(prev => ({ ...prev, type }));
    if (type === 'single') {
      setFormData(prev => ({ ...prev, altitude: altitudeData.single }));
    } else {
      const rangeValue = altitudeData.rangeMin && altitudeData.rangeMax 
        ? `${altitudeData.rangeMin}-${altitudeData.rangeMax}m`
        : '';
      setFormData(prev => ({ ...prev, altitude: rangeValue }));
    }
  }, [altitudeData]);

  // 컵 노트 태그 처리
  const handleCupNoteTagClick = useCallback((tag: string) => {
    setSelectedCupNoteTags(prev => {
      const newTags = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag];
      
      const allNotes = [...newTags, customCupNote].filter(Boolean);
      setFormData(prevForm => ({ ...prevForm, cup_notes: allNotes.join(', ') }));
      
      return newTags;
    });
  }, [customCupNote]);

  const handleCustomCupNoteChange = useCallback((value: string) => {
    setCustomCupNote(value);
    const allNotes = [...selectedCupNoteTags, value].filter(Boolean);
    setFormData(prev => ({ ...prev, cup_notes: allNotes.join(', ') }));
  }, [selectedCupNoteTags]);

  // 컵 노트 초기화 (기존 데이터가 있을 때)
  useEffect(() => {
    if (initialData?.cup_notes && selectedCupNoteTags.length === 0 && !customCupNote) {
      const notes = initialData.cup_notes.split(',').map((note: string) => note.trim());
      const tagMatches = notes.filter((note: string) => CUP_NOTE_TAGS.includes(note));
      const customNotes = notes.filter((note: string) => !CUP_NOTE_TAGS.includes(note));
      
      setSelectedCupNoteTags(tagMatches);
      setCustomCupNote(customNotes.join(', '));
    }
  }, [initialData?.cup_notes, selectedCupNoteTags.length, customCupNote]);

  // 자동 제목 생성
  useEffect(() => {
    if (!formData.title.trim() && (formData.country || formData.region || formData.farm)) {
      const autoTitle = generateUniqueTitleFromData(
        {
          country: formData.country,
          region: formData.region,
          farm: formData.farm,
        },
        existingNotes
      );
      
      if (autoTitle) {
        setFormData(prev => ({ ...prev, title: autoTitle }));
      }
    }
  }, [formData.country, formData.region, formData.farm, formData.title, existingNotes]);

  // 기본 유효성 검사
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    if (!formData.title.trim()) {
      errors.push('제목을 입력해주세요.');
    }
    
    if (formData.overall === 0 && formData.aroma === 0 && formData.flavor === 0) {
      errors.push('최소 한 가지 평점을 입력해주세요.');
    }
    
    return errors;
  }, [formData.title, formData.overall, formData.aroma, formData.flavor]);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }
    
    // 데이터 구조화
    const submitData = {
      title: formData.title.trim() || '새 테이스팅 노트',
      date: formData.date || new Date().toISOString(),
      country: formData.country.trim() || null,
      region: formData.region.trim() || null,
      farm: formData.farm.trim() || null,
      variety: formData.variety.trim() || null,
      process: formData.process.trim() || null,
      altitude: formData.altitude.trim() || null,
      cup_notes: formData.cup_notes.trim() || null,
      store_info: formData.store_info.trim() || null,
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
  }, [formData, onSubmit, validateForm]);

  const RatingInput = ({ label, category, value }: { label: string; category: string; value: number }) => {
    const renderStars = (rating: number) => {
      const stars = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;
      
      for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
          stars.push(
            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        } else if (i === fullStars && hasHalfStar) {
          stars.push(
            <div key={i} className="relative w-5 h-5">
              <svg className="w-5 h-5 text-stone-300 fill-current absolute" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5 text-yellow-400 fill-current absolute" viewBox="0 0 20 20" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          );
        } else {
          stars.push(
            <svg key={i} className="w-5 h-5 text-stone-300 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          );
        }
      }
      return stars;
    };
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-stone-700">
          {label}
        </label>
        
        {/* 별점 표시 */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-1">
            {renderStars(value)}
          </div>
          <span className="text-sm font-medium text-stone-600 ml-2">
            {value}/5
          </span>
          {value >= 4.5 && <span className="text-sm text-emerald-600 font-medium">우수</span>}
          {value >= 3.5 && value < 4.5 && <span className="text-sm text-blue-600 font-medium">좋음</span>}
          {value >= 2.5 && value < 3.5 && <span className="text-sm text-yellow-600 font-medium">보통</span>}
          {value < 2.5 && value > 0 && <span className="text-sm text-red-600 font-medium">개선 필요</span>}
        </div>
        
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
        </div>
      </div>
    );
  };

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

          {/* 원산지 정보 - AutoComplete */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AutoCompleteInput
              label="원산지"
              name="country"
              value={formData.country}
              onChange={handleCountryChange}
              onMatch={handleCountryMatch}
              placeholder="예: 에티오피아, 브라질, 콜롬비아..."
              matcher={matchCountry}
              suggestions={COFFEE_COUNTRIES}
              dropdownHeader="🌍 추천 원산지:"
            />

            <AutoCompleteInput
              label="지역"
              name="region"
              value={formData.region}
              onChange={handleRegionChange}
              onMatch={handleRegionMatch}
              placeholder="예: 예가체프, 후일라, 나리뇨..."
              matcher={matchRegion}
              suggestions={ALL_REGIONS}
              dropdownHeader="🗺️ 추천 지역:"
            />
          </div>

          {/* 농장 & 품종 - AutoComplete */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AutoCompleteInput
              label="농장"
              name="farm"
              value={formData.farm}
              onChange={handleFarmChange}
              onMatch={handleFarmMatch}
              placeholder="예: 워카 농장, 딜라 코게 농장..."
              matcher={matchFarm}
              suggestions={ALL_FARMS}
              dropdownHeader="🏕️ 추천 농장:"
            />

            <AutoCompleteInput
              label="품종"
              name="variety"
              value={formData.variety}
              onChange={handleVarietyChange}
              onMatch={handleVarietyMatch}
              placeholder="예: 헤이룸, 게이샤, 부르봉..."
              matcher={matchVariety}
              suggestions={COFFEE_VARIETIES}
              dropdownHeader="🌱 추천 품종:"
            />
          </div>

          {/* 가공 방법 & 고도 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* 고도 입력 (단일/범위) */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                고도
              </label>
              
              {/* 고도 타입 선택 */}
              <div className="flex space-x-4 mb-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="altitudeType"
                    value="single"
                    checked={altitudeData.type === 'single'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAltitudeTypeChange('single');
                      }
                    }}
                    className="text-emerald-600 focus:ring-emerald-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-stone-700">단일 고도</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="altitudeType"
                    value="range"
                    checked={altitudeData.type === 'range'}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAltitudeTypeChange('range');
                      }
                    }}
                    className="text-emerald-600 focus:ring-emerald-500"
                    disabled={loading}
                  />
                  <span className="text-sm text-stone-700">범위</span>
                </label>
              </div>

              {/* 고도 입력 필드 */}
              {altitudeData.type === 'single' ? (
                <input
                  type="text"
                  value={altitudeData.single}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAltitudeData(prev => ({ ...prev, single: value }));
                    setFormData(prev => ({ ...prev, altitude: value }));
                  }}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                  placeholder="예: 1800m, 2000m"
                  disabled={loading}
                />
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={altitudeData.rangeMin}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAltitudeData(prev => ({ ...prev, rangeMin: value }));
                      const rangeValue = value && altitudeData.rangeMax 
                        ? `${value}-${altitudeData.rangeMax}m`
                        : '';
                      setFormData(prev => ({ ...prev, altitude: rangeValue }));
                    }}
                    className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="최소 (예: 1800)"
                    disabled={loading}
                  />
                  <span className="flex items-center text-stone-500">-</span>
                  <input
                    type="text"
                    value={altitudeData.rangeMax}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAltitudeData(prev => ({ ...prev, rangeMax: value }));
                      const rangeValue = altitudeData.rangeMin && value 
                        ? `${altitudeData.rangeMin}-${value}m`
                        : '';
                      setFormData(prev => ({ ...prev, altitude: rangeValue }));
                    }}
                    className="flex-1 px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                    placeholder="최대 (예: 2000)"
                    disabled={loading}
                  />
                </div>
              )}
              
              {formData.altitude && (
                <div className="mt-2 text-sm text-emerald-600">
                  저장될 값: <span className="font-medium text-stone-700">{formData.altitude}</span>
                </div>
              )}
            </div>
          </div>

          {/* 컵 노트 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              컵 노트
            </label>
            
            {/* 태그 선택 */}
            <div className="mb-4">
              <p className="text-sm text-stone-600 mb-3">💫 자주 사용되는 컵 노트 태그:</p>
              <div className="flex flex-wrap gap-2">
                {CUP_NOTE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleCupNoteTagClick(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCupNoteTags.includes(tag)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-stone-100 text-stone-700 border border-stone-200 hover:bg-stone-200'
                    }`}
                    disabled={loading}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 커스텀 컵 노트 입력 */}
            <div className="space-y-3">
              <input
                type="text"
                value={customCupNote}
                onChange={(e) => handleCustomCupNoteChange(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="직접 입력: 예를 들어 '다크 초콜릿', '오렌지 제스트' 등..."
                disabled={loading}
              />
              
              {/* 최종 컵 노트 미리보기 */}
              {formData.cup_notes && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-sm text-emerald-700 font-medium mb-1">저장될 컵 노트:</p>
                  <p className="text-sm text-stone-700">{formData.cup_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 평점 시스템 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-xl font-light text-stone-900 mb-6 border-b border-stone-200 pb-3 brand-font">
          Ratings
        </h2>
        
        {/* 전체 평점 */}
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200">
          <RatingInput label="⭐ 전체적인 인상 (Overall)" category="overall" value={formData.overall} />
        </div>
        
        {/* 세부 평점 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RatingInput label="향미 (Aroma)" category="aroma" value={formData.aroma} />
          <RatingInput label="맛 (Flavor)" category="flavor" value={formData.flavor} />
          <RatingInput label="여운 (Aftertaste)" category="aftertaste" value={formData.aftertaste} />
          <RatingInput label="산미 (Acidity)" category="acidity" value={formData.acidity} />
          <RatingInput label="바디감 (Body)" category="body" value={formData.body} />
          <RatingInput label="균형감 (Balance)" category="balance" value={formData.balance} />
          <RatingInput label="단맛 (Sweetness)" category="sweetness" value={formData.sweetness} />
        </div>
        
        {/* 평점 요약 */}
        {(formData.overall > 0 || formData.aroma > 0 || formData.flavor > 0) && (
          <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
            <h4 className="text-sm font-medium text-stone-700 mb-2">평점 요약</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <div className="font-medium text-stone-900">{formData.overall}</div>
                <div className="text-stone-600">전체</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-stone-900">{formData.aroma}</div>
                <div className="text-stone-600">향미</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-stone-900">{formData.flavor}</div>
                <div className="text-stone-600">맛</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-stone-900">{formData.aftertaste}</div>
                <div className="text-stone-600">여운</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 추가 정보 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
        <h2 className="text-xl font-light text-stone-900 mb-6 border-b border-stone-200 pb-3 brand-font">
          Additional Information
        </h2>
        
        <div className="space-y-6">
          {/* 테이스팅 날짜 & 시간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                테이스팅 날짜 & 시간
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                구매처 / 매장 정보
              </label>
              <input
                type="text"
                name="store_info"
                value={formData.store_info}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                placeholder="예: 블루보틀 강남점, 원두커피 온라인몰"
                disabled={loading}
              />
            </div>
          </div>
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
        <div className="bg-gradient-to-t from-stone-50 via-stone-50 to-transparent pt-8">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-900 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                저장 중...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {mode === 'create' ? '테이스팅 노트 저장' : '테이스팅 노트 수정'}
              </div>
            )}
          </button>
          
          {/* 저장 도움말 */}
          <p className="text-center text-sm text-stone-500 mt-3 mb-2">
            필수: 제목, 최소 1개 평점 | 나머지 선택사항
          </p>
        </div>
      </div>

      {/* 스타일링 */}
      <style jsx>{`
        .slider {
          background: linear-gradient(to right, #e5e7eb 0%, #10b981 var(--value, 0%), #e5e7eb var(--value, 0%));
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #065f46, #10b981);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(6, 95, 70, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(6, 95, 70, 0.4);
        }

        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #065f46, #10b981);
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(6, 95, 70, 0.3);
          transition: all 0.2s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(6, 95, 70, 0.4);
        }
        
        .brand-font {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: -0.025em;
        }
      `}</style>
    </form>
  );
}