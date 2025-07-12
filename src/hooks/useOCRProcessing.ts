'use client';

import { useState, useCallback } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface OCRState {
  isProcessing: boolean;
  progress: number;
  status: string;
  error: string | null;
  extractedText: string;
}

interface OCRResult {
  text: string;
  processingTime: number;
  confidence?: number;
}

export function useOCRProcessing() {
  const [state, setState] = useState<OCRState>({
    isProcessing: false,
    progress: 0,
    status: '대기 중...',
    error: null,
    extractedText: '',
  });

  const processImage = useCallback(async (imageFile: File): Promise<OCRResult | null> => {
    const startTime = Date.now();
    
    setState({
      isProcessing: true,
      progress: 0,
      status: '준비 중...',
      error: null,
      extractedText: '',
    });

    try {
      // 1. API 키 확인
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        throw new Error('Google AI API 키가 설정되지 않았습니다');
      }

      // 2. 이미지를 base64로 변환
      setState(prev => ({ ...prev, progress: 20, status: '이미지 변환 중...' }));
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // base64 부분만 추출
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // 3. Gemini API로 OCR 처리
      setState(prev => ({ ...prev, progress: 50, status: 'AI 텍스트 인식 중...' }));
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `이 이미지에서 모든 텍스트를 정확하게 추출해 주세요.

특히 다음 정보들을 우선적으로 인식해 주세요:
- 커피 이름 및 브랜드
- 원산지 (Origin)
- 품종 (Variety)
- 농장 (Farm)
- 지역 (Region)
- 고도 (Altitude)
- 가공방법 (Process)
- 테이스팅 노트 (Tasting Notes)
- 로스팅 정보
- 매장 정보

인식된 텍스트를 그대로 반환해 주세요. 해석이나 추가 설명은 하지 말고 원본 텍스트만 추출해 주세요.`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: imageFile.type,
          },
        },
      ]);

      const response = await result.response;
      const extractedText = response.text() || '';

      if (!extractedText.trim()) {
        throw new Error('이미지에서 텍스트를 인식할 수 없습니다');
      }

      setState(prev => ({ ...prev, progress: 100, status: '완료', extractedText }));
      
      const processingTime = Date.now() - startTime;
      
      setState({
        isProcessing: false,
        progress: 100,
        status: '텍스트 인식 완료',
        error: null,
        extractedText,
      });

      return {
        text: extractedText,
        processingTime,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OCR 처리 중 오류가 발생했습니다';
      setState({
        isProcessing: false,
        progress: 0,
        status: '오류 발생',
        error: errorMessage,
        extractedText: '',
      });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      status: '대기 중...',
      error: null,
      extractedText: '',
    });
  }, []);

  const retry = useCallback(async (imageFile: File) => {
    reset();
    return await processImage(imageFile);
  }, [processImage, reset]);

  return {
    ...state,
    processImage,
    reset,
    retry,
  };
}