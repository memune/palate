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
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon & Title */}
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-gray-900 tracking-tight brand-font">
            Reading Text
          </h2>
        </div>
        
        {/* Progress */}
        <div className="space-y-4">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-emerald-700 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-600 text-lg font-light">{status}</p>
        </div>
        
        {/* Loading Animation */}
        {isProcessing && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-emerald-700"></div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="text-red-600 font-light">
            <p>{error}</p>
          </div>
        )}
        
        {/* Success State */}
        {extractedText && !isProcessing && (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-700 font-medium">텍스트 인식 완료</p>
          </div>
        )}
      </div>
    </div>
  );
}