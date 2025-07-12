// 기본 평점값
export const DEFAULT_RATINGS = {
  aroma: 5,
  flavor: 5,
  acidity: 5,
  sweetness: 5,
  body: 5,
  aftertaste: 5,
  balance: 5,
  overall: 5,
};

// 평점 카테고리 라벨
export const RATING_CATEGORIES = [
  { key: 'aroma', label: '향 (Aroma)' },
  { key: 'flavor', label: '맛 (Flavor)' },
  { key: 'acidity', label: '산미 (Acidity)' },
  { key: 'sweetness', label: '단맛 (Sweetness)' },
  { key: 'body', label: '바디 (Body)' },
  { key: 'aftertaste', label: '후미 (Aftertaste)' },
  { key: 'balance', label: '균형 (Balance)' },
  { key: 'overall', label: '전체 (Overall)' },
] as const;

// 평점 범위
export const RATING_CONFIG = {
  min: 1,
  max: 10,
  step: 0.5,
  default: 5,
} as const;