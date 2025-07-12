/**
 * 커피 데이터 매칭 유틸리티
 * 사용자 입력을 정규화된 마스터 데이터와 매칭
 */

import {
  COFFEE_COUNTRIES,
  COFFEE_VARIETIES,
  PROCESSING_METHODS,
  ROASTING_LEVELS,
  COFFEE_REGIONS,
  COFFEE_FARMS,
} from '@/constants/defaults';

export interface MatchResult {
  id: string;
  name: string;
  englishName: string;
  confidence: number; // 0-100, 매칭 신뢰도
}

/**
 * 문자열 유사도 계산 (Levenshtein Distance 기반)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (s1.includes(s2) || s2.includes(s1)) return 85;
  
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // insertion
        matrix[j - 1][i] + 1,     // deletion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s2.length][s1.length];
  return Math.round((1 - distance / maxLength) * 100);
}

/**
 * 배열에서 가장 유사한 항목 찾기
 */
function findBestMatch(
  input: string,
  items: readonly any[],
  minConfidence: number = 70
): MatchResult | null {
  if (!input || input.trim().length === 0) return null;
  
  let bestMatch: MatchResult | null = null;
  let highestConfidence = 0;
  
  for (const item of items) {
    // aliases 배열에서 매칭 확인
    for (const alias of item.aliases) {
      const confidence = calculateSimilarity(input, alias);
      
      if (confidence > highestConfidence && confidence >= minConfidence) {
        highestConfidence = confidence;
        bestMatch = {
          id: item.id,
          name: item.name,
          englishName: item.englishName,
          confidence,
        };
      }
    }
  }
  
  return bestMatch;
}

/**
 * 국가 매칭
 */
export function matchCountry(input: string): MatchResult | null {
  return findBestMatch(input, COFFEE_COUNTRIES);
}

/**
 * 품종 매칭
 */
export function matchVariety(input: string): MatchResult | null {
  return findBestMatch(input, COFFEE_VARIETIES);
}

/**
 * 가공방법 매칭
 */
export function matchProcessingMethod(input: string): MatchResult | null {
  return findBestMatch(input, PROCESSING_METHODS);
}

/**
 * 로스팅 레벨 매칭
 */
export function matchRoastingLevel(input: string): MatchResult | null {
  return findBestMatch(input, ROASTING_LEVELS);
}

/**
 * 지역 매칭 (국가별)
 */
export function matchRegion(input: string, countryId?: string): MatchResult | null {
  if (!input || input.trim().length === 0) return null;
  
  let regionsToSearch: readonly string[] = [];
  
  if (countryId && countryId in COFFEE_REGIONS) {
    // 특정 국가의 지역만 검색
    regionsToSearch = COFFEE_REGIONS[countryId as keyof typeof COFFEE_REGIONS];
  } else {
    // 모든 지역에서 검색
    regionsToSearch = Object.values(COFFEE_REGIONS).flat();
  }
  
  let bestMatch: MatchResult | null = null;
  let highestConfidence = 0;
  
  for (const region of regionsToSearch) {
    const confidence = calculateSimilarity(input, region);
    
    if (confidence > highestConfidence && confidence >= 70) {
      highestConfidence = confidence;
      bestMatch = {
        id: region.toLowerCase().replace(/\s+/g, '_'),
        name: region,
        englishName: region,
        confidence,
      };
    }
  }
  
  return bestMatch;
}

/**
 * 농장 매칭 (지역별)
 */
export function matchFarm(input: string, regionName?: string): MatchResult | null {
  if (!input || input.trim().length === 0) return null;
  
  let farmsToSearch: readonly string[] = [];
  
  if (regionName && regionName in COFFEE_FARMS) {
    // 특정 지역의 농장만 검색
    farmsToSearch = COFFEE_FARMS[regionName as keyof typeof COFFEE_FARMS];
  } else {
    // 모든 농장에서 검색
    farmsToSearch = Object.values(COFFEE_FARMS).flat();
  }
  
  let bestMatch: MatchResult | null = null;
  let highestConfidence = 0;
  
  for (const farm of farmsToSearch) {
    const confidence = calculateSimilarity(input, farm);
    
    if (confidence > highestConfidence && confidence >= 70) {
      highestConfidence = confidence;
      bestMatch = {
        id: farm.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        name: farm,
        englishName: farm,
        confidence,
      };
    }
  }
  
  return bestMatch;
}

/**
 * 모든 필드에 대한 통합 매칭
 */
export interface CoffeeDataSuggestions {
  country?: MatchResult | null;
  region?: MatchResult | null;
  farm?: MatchResult | null;
  variety?: MatchResult | null;
  process?: MatchResult | null;
  roastLevel?: MatchResult | null;
}

export function matchCoffeeData(data: {
  country?: string;
  region?: string;
  variety?: string;
  process?: string;
  roastLevel?: string;
}): CoffeeDataSuggestions {
  const suggestions: CoffeeDataSuggestions = {};
  
  if (data.country) {
    suggestions.country = matchCountry(data.country);
  }
  
  if (data.region) {
    const countryId = suggestions.country?.id;
    suggestions.region = matchRegion(data.region, countryId);
  }
  
  if (data.variety) {
    suggestions.variety = matchVariety(data.variety);
  }
  
  if (data.process) {
    suggestions.process = matchProcessingMethod(data.process);
  }
  
  if (data.roastLevel) {
    suggestions.roastLevel = matchRoastingLevel(data.roastLevel);
  }
  
  return suggestions;
}

/**
 * 매칭 결과를 사용자에게 보여줄 형태로 변환
 */
export function formatMatchResult(match: MatchResult): string {
  if (match.confidence >= 95) {
    return match.name;
  } else if (match.confidence >= 80) {
    return `${match.name} (${match.confidence}% 일치)`;
  } else {
    return `${match.name} (${match.englishName}) - ${match.confidence}% 일치`;
  }
}