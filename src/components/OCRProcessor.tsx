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
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        {/* Title */}
        <h2 className="text-lg font-light text-gray-700 tracking-tight">
          텍스트 인식 중
        </h2>
        
        {/* Progress */}
        <div className="space-y-3">
          <div className="w-full bg-gray-100 rounded-full h-1">
            <div
              className="bg-emerald-700 h-1 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-sm font-light">{status}</p>
        </div>
        
        {/* Loading Animation */}
        {isProcessing && (
          <div className="flex justify-center pt-2">
            <div className="animate-spin rounded-full h-4 w-4 border border-gray-200 border-t-emerald-700"></div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="text-red-600 text-sm font-light">
            <p>{error}</p>
          </div>
        )}
        
        {/* Success State */}
        {extractedText && !isProcessing && (
          <p className="text-emerald-700 text-sm font-medium">완료</p>
        )}
      </div>
    </div>
  );
}