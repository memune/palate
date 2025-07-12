'use client';

import { useEffect } from 'react';
import { useOCRProcessing } from '@/hooks/useOCRProcessing';

interface OCRProcessorProps {
  imageFile: File;
  onComplete: (text: string) => void;
  onError: (error: Error) => void;
}

export default function OCRProcessor({ imageFile, onComplete, onError }: OCRProcessorProps) {
  const { 
    isProcessing, 
    progress, 
    status, 
    error, 
    extractedText, 
    processImage 
  } = useOCRProcessing();

  useEffect(() => {
    const handleOCR = async () => {
      const result = await processImage(imageFile);
      
      if (result) {
        // 성공적으로 처리된 경우
        setTimeout(() => {
          onComplete(result.text);
        }, 1000);
      } else if (error) {
        // 오류가 발생한 경우
        onError(new Error(error));
      }
    };

    handleOCR();
  }, [imageFile, processImage, onComplete, onError, error]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
      <div className="text-center space-y-6">
        <h2 className="text-xl font-semibold text-stone-900">텍스트 인식 중</h2>
        
        {/* Progress Bar */}
        <div className="w-full bg-stone-200 rounded-full h-3">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Status */}
        <p className="text-stone-600 text-lg">{status}</p>
        
        {/* Progress Percentage */}
        <p className="text-stone-500 text-sm">{progress}% 완료</p>
        
        {/* Loading Animation */}
        {isProcessing && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {/* Extracted Text Preview */}
        {extractedText && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-left">
            <h3 className="text-sm font-medium text-emerald-800 mb-2">인식된 텍스트 미리보기:</h3>
            <p className="text-emerald-700 text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
              {extractedText.substring(0, 200)}
              {extractedText.length > 200 && '...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}