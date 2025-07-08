'use client';

import { useEffect, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface OCRProcessorProps {
  imageFile: File;
  onComplete: (text: string) => void;
  onError: (error: Error) => void;
}

export default function OCRProcessor({ imageFile, onComplete, onError }: OCRProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('준비중...');
  const [extractedText, setExtractedText] = useState<string>('');

  useEffect(() => {
    const processImage = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
        if (!apiKey) {
          throw new Error('Google AI API 키가 설정되지 않았습니다. 환경변수를 확인해주세요.');
        }

        setStatus('이미지 변환 중...');
        setProgress(20);

        // 이미지를 base64로 변환
        const imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // base64 부분만 추출
          };
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        setStatus('Gemini Flash로 텍스트 인식 중...');
        setProgress(50);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `이 이미지에서 모든 텍스트를 정확하게 추출해 주세요.

특히 다음 정보들을 우선적으로 인식해 주세요:
- 커피 이름 및 브랜드
- 원산지 (Origin)
- 품종 (Variety)
- 가공 방법 (Process)
- 로스팅 정보 (Roast Level)
- 맛 노트 (Tasting Notes)
- 가격 정보
- 기타 모든 텍스트

한국어와 영어 모두 정확하게 인식해 주세요.
작은 글씨나 손글씨도 최대한 읽어주세요.
텍스트를 그대로 추출하되, 읽기 쉽게 줄바꿈을 적절히 해주세요.`;

        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: imageBase64,
              mimeType: imageFile.type
            }
          }
        ]);

        setProgress(90);
        setStatus('텍스트 추출 완료!');

        const text = result.response.text();
        setProgress(100);
        
        // 인식된 텍스트를 상태에 저장
        setExtractedText(text);
        
        // 잠시 완료 상태를 보여준 후 콜백 호출
        setTimeout(() => {
          onComplete(text);
        }, 500);

      } catch (error) {
        console.error('Gemini OCR Error:', error);
        
        // 더 구체적인 에러 메시지 제공
        let errorMessage = '오류가 발생했습니다.';
        if (error instanceof Error) {
          if (error.message.includes('API 키')) {
            errorMessage = 'API 키가 설정되지 않았습니다. 관리자에게 문의하세요.';
          } else if (error.message.includes('quota')) {
            errorMessage = 'API 사용량이 초과되었습니다.';
          } else if (error.message.includes('network')) {
            errorMessage = '네트워크 연결을 확인해주세요.';
          } else {
            errorMessage = `OCR 처리 중 오류: ${error.message}`;
          }
        }
        
        setStatus(errorMessage);
        onError(error as Error);
      }
    };

    processImage();
  }, [imageFile, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">🤖 Gemini Flash OCR</h2>
          <p className="text-gray-600">{status}</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          {progress}% 완료
        </div>
        
        {progress === 100 && (
          <div className="mt-4 text-center text-green-600 font-medium">
            ✅ AI가 텍스트를 성공적으로 인식했습니다!
          </div>
        )}
      </div>
      
      {/* 인식된 텍스트 표시 영역 */}
      {extractedText && (
        <div className="mt-6 w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📝 인식된 텍스트</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <textarea
              value={extractedText}
              readOnly
              className="w-full h-40 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="인식된 텍스트가 여기에 표시됩니다..."
            />
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {extractedText.length}자 인식됨
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(extractedText)}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                📋 복사
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}