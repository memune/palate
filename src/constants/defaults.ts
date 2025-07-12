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

// 커피 원산지 국가 (다국어 지원)
export const COFFEE_COUNTRIES = [
  { 
    id: 'brazil',
    name: '브라질',
    englishName: 'Brazil',
    aliases: ['brazil', 'Brasil', '브라질', 'BRAZIL']
  },
  { 
    id: 'colombia',
    name: '콜롬비아',
    englishName: 'Colombia',
    aliases: ['colombia', 'Columbia', '콜롬비아', 'COLOMBIA']
  },
  { 
    id: 'ethiopia',
    name: '에티오피아',
    englishName: 'Ethiopia',
    aliases: ['ethiopia', '에티오피아', 'ETHIOPIA']
  },
  { 
    id: 'kenya',
    name: '케냐',
    englishName: 'Kenya',
    aliases: ['kenya', '케냐', 'KENYA']
  },
  { 
    id: 'guatemala',
    name: '과테말라',
    englishName: 'Guatemala',
    aliases: ['guatemala', '과테말라', 'GUATEMALA']
  },
  { 
    id: 'costa_rica',
    name: '코스타리카',
    englishName: 'Costa Rica',
    aliases: ['costa rica', 'costarica', '코스타리카', 'COSTA RICA']
  },
  { 
    id: 'panama',
    name: '파나마',
    englishName: 'Panama',
    aliases: ['panama', '파나마', 'PANAMA']
  },
  { 
    id: 'jamaica',
    name: '자메이카',
    englishName: 'Jamaica',
    aliases: ['jamaica', '자메이카', 'JAMAICA']
  },
  { 
    id: 'hawaii',
    name: '하와이',
    englishName: 'Hawaii',
    aliases: ['hawaii', '하와이', 'HAWAII']
  },
  { 
    id: 'yemen',
    name: '예멘',
    englishName: 'Yemen',
    aliases: ['yemen', '예멘', 'YEMEN']
  },
  { 
    id: 'indonesia',
    name: '인도네시아',
    englishName: 'Indonesia',
    aliases: ['indonesia', '인도네시아', 'INDONESIA']
  },
  { 
    id: 'peru',
    name: '페루',
    englishName: 'Peru',
    aliases: ['peru', '페루', 'PERU']
  },
] as const;

// 주요 커피 재배 지역 (국가별)
export const COFFEE_REGIONS = {
  brazil: ['세라도', 'Sul de Minas', '상파울로', 'Bahia'],
  colombia: ['우일라', '나리뇨', '칼다스', 'Tolima', 'Cauca'],
  ethiopia: ['시다모', '예가체프', 'Harrar', 'Limu', 'Djimmah'],
  kenya: ['중앙고원', 'Nyeri', 'Kirinyaga', 'Murang\'a'],
  guatemala: ['안티구아', 'Atitlan', 'Coban', 'Fraijanes'],
  costa_rica: ['타라주', 'Central Valley', 'West Valley', 'Brunca'],
  panama: ['보케테', 'Volcan', 'Renacimiento'],
  jamaica: ['블루마운틴'],
  hawaii: ['코나'],
  yemen: ['모카'],
  indonesia: ['수마트라', '자바', '술라웨시', 'Flores'],
  peru: ['Chanchamayo', 'Cusco', 'Amazonas'],
} as const;

// 커피 품종
export const COFFEE_VARIETIES = [
  { 
    id: 'geisha',
    name: '게이샤',
    englishName: 'Geisha',
    aliases: ['geisha', 'gesha', '게이샤', '게샤', 'GEISHA']
  },
  { 
    id: 'bourbon',
    name: '부르봉',
    englishName: 'Bourbon',
    aliases: ['bourbon', '부르봉', 'BOURBON']
  },
  { 
    id: 'typica',
    name: '티피카',
    englishName: 'Typica',
    aliases: ['typica', '티피카', 'TYPICA']
  },
  { 
    id: 'caturra',
    name: '카투라',
    englishName: 'Caturra',
    aliases: ['caturra', '카투라', 'CATURRA']
  },
  { 
    id: 'catuai',
    name: '카투아이',
    englishName: 'Catuai',
    aliases: ['catuai', '카투아이', 'CATUAI']
  },
  { 
    id: 'pacamara',
    name: '파카마라',
    englishName: 'Pacamara',
    aliases: ['pacamara', '파카마라', 'PACAMARA']
  },
  { 
    id: 'sl28',
    name: 'SL28',
    englishName: 'SL28',
    aliases: ['sl28', 'sl-28', 'SL28', 'SL-28']
  },
  { 
    id: 'sl34',
    name: 'SL34',
    englishName: 'SL34',
    aliases: ['sl34', 'sl-34', 'SL34', 'SL-34']
  },
  { 
    id: 'heirloom',
    name: '에어룸',
    englishName: 'Heirloom',
    aliases: ['heirloom', '에어룸', '토착품종', 'HEIRLOOM']
  },
] as const;

// 가공 방법
export const PROCESSING_METHODS = [
  { 
    id: 'washed',
    name: '워시드',
    englishName: 'Washed',
    aliases: ['washed', 'wet', '워시드', '수세식', 'WASHED', '물세척']
  },
  { 
    id: 'natural',
    name: '내추럴',
    englishName: 'Natural',
    aliases: ['natural', 'dry', '내추럴', '건식', 'NATURAL', '자연건조']
  },
  { 
    id: 'honey',
    name: '허니',
    englishName: 'Honey',
    aliases: ['honey', 'pulped natural', '허니', '펄프드 내추럴', 'HONEY']
  },
  { 
    id: 'semi_washed',
    name: '세미 워시드',
    englishName: 'Semi-Washed',
    aliases: ['semi washed', 'semi-washed', '세미워시드', '반수세식', 'SEMI WASHED']
  },
  { 
    id: 'anaerobic',
    name: '혐기성 발효',
    englishName: 'Anaerobic',
    aliases: ['anaerobic', '혐기성', '무산소', 'ANAEROBIC']
  },
] as const;

// 로스팅 레벨
export const ROASTING_LEVELS = [
  { 
    id: 'light',
    name: '라이트',
    englishName: 'Light',
    aliases: ['light', '라이트', '연한', 'LIGHT']
  },
  { 
    id: 'medium_light',
    name: '미디엄 라이트',
    englishName: 'Medium Light',
    aliases: ['medium light', 'medium-light', '미디엄라이트', 'MEDIUM LIGHT']
  },
  { 
    id: 'medium',
    name: '미디엄',
    englishName: 'Medium',
    aliases: ['medium', '미디엄', '중간', 'MEDIUM']
  },
  { 
    id: 'medium_dark',
    name: '미디엄 다크',
    englishName: 'Medium Dark',
    aliases: ['medium dark', 'medium-dark', '미디엄다크', 'MEDIUM DARK']
  },
  { 
    id: 'dark',
    name: '다크',
    englishName: 'Dark',
    aliases: ['dark', '다크', '진한', 'DARK']
  },
] as const;