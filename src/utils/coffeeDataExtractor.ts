import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedCoffeeData } from '@/types';

export async function extractCoffeeDataFromText(text: string): Promise<ExtractedCoffeeData> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Google AI API 키가 설정되지 않았습니다.');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `다음 텍스트에서 커피 정보를 추출하여 JSON 형태로 반환해주세요.

텍스트:
"${text}"

다음 필드들을 찾아서 JSON으로 반환해주세요:
- country: 국가 (예: 에티오피아, 콜롬비아, 케냐 등)
- farm: 농장명
- region: 지역/동네 (예: 예가체프, 후일라, 나리뇨 등)
- variety: 품종 (예: 게이샤, 버번, 티피카 등)
- altitude: 고도 정보 (예: 1800m, 1500-1700m 등)
- process: 프로세싱 방법 (예: 워시드, 내추럴, 허니 등)
- cupNotes: 컵노트/맛 설명 (예: 플로럴, 초콜릿, 시트러스 등)
- storeInfo: 매장/로스터리 정보
- title: 커피 이름/제품명

각 필드가 텍스트에서 찾을 수 없다면 해당 필드는 포함하지 마세요.
JSON만 반환하고 다른 설명은 포함하지 마세요.

예시:
{
  "country": "에티오피아",
  "region": "예가체프",
  "variety": "게이샤",
  "altitude": "1800m",
  "process": "워시드",
  "cupNotes": "플로럴, 자스민, 베르가못",
  "title": "예가체프 게이샤"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // JSON 부분만 추출 (마크다운 코드 블록 제거)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('JSON 형태의 응답을 찾을 수 없습니다:', responseText);
      return {};
    }

    try {
      const extractedData = JSON.parse(jsonMatch[0]);
      console.log('추출된 커피 데이터:', extractedData);
      return extractedData;
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      return {};
    }

  } catch (error) {
    console.error('커피 데이터 추출 오류:', error);
    return {};
  }
}