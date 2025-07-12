interface TitleGeneratorData {
  country?: string;
  region?: string;
  farm?: string;
}

interface ExistingNote {
  title: string;
}

/**
 * 국가, 지역, 농장 정보를 기반으로 테이스팅 노트 제목을 자동 생성합니다.
 */
export function generateTitle(data: TitleGeneratorData): string {
  const parts: string[] = [];
  
  // 국가, 지역, 농장 순서로 제목 구성
  if (data.country?.trim()) {
    parts.push(data.country.trim());
  }
  
  if (data.region?.trim()) {
    parts.push(data.region.trim());
  }
  
  if (data.farm?.trim()) {
    parts.push(data.farm.trim());
  }
  
  // 최소한 하나의 정보가 있어야 제목 생성
  if (parts.length === 0) {
    return '';
  }
  
  return parts.join(' ');
}

/**
 * 기존 제목들과 중복을 방지하기 위해 넘버링을 추가합니다.
 */
export function generateUniqueTitle(
  baseTitle: string, 
  existingTitles: string[]
): string {
  if (!baseTitle.trim()) {
    return '';
  }
  
  const trimmedTitle = baseTitle.trim();
  
  // 기존 제목과 중복되지 않으면 그대로 반환
  if (!existingTitles.includes(trimmedTitle)) {
    return trimmedTitle;
  }
  
  // 중복되면 번호를 붙여서 고유한 제목 생성
  let counter = 2;
  let uniqueTitle = `${trimmedTitle} ${counter}`;
  
  while (existingTitles.includes(uniqueTitle)) {
    counter++;
    uniqueTitle = `${trimmedTitle} ${counter}`;
  }
  
  return uniqueTitle;
}

/**
 * 테이스팅 노트 데이터와 기존 노트들을 기반으로 고유한 제목을 생성합니다.
 */
export function generateUniqueTitleFromData(
  data: TitleGeneratorData,
  existingNotes: ExistingNote[]
): string {
  const baseTitle = generateTitle(data);
  
  if (!baseTitle) {
    return '';
  }
  
  const existingTitles = existingNotes.map(note => note.title);
  return generateUniqueTitle(baseTitle, existingTitles);
}