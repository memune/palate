/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 평점에 따른 색상 클래스 반환
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 8) return 'bg-emerald-500';
  if (rating >= 6) return 'bg-yellow-500';
  return 'bg-red-500';
};

/**
 * 평점을 소수점 포함하여 포맷팅
 */
export const formatRating = (rating: number): string => {
  return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
};

/**
 * 텍스트를 지정된 길이로 자르기 (줄임표 포함)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};