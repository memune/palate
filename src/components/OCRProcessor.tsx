'use client';

import { useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

interface OCRProcessorProps {
  imageFile: File;
  onComplete: (text: string) => void;
  onError: (error: Error) => void;
}

export default function OCRProcessor({ imageFile, onComplete, onError }: OCRProcessorProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('준비중...');

  useEffect(() => {
    const processImage = async () => {
      try {
        setStatus('OCR 처리 시작...');
        
        const { data: { text } } = await Tesseract.recognize(imageFile, 'eng+kor', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
              setStatus(`텍스트 인식 중... ${Math.round(m.progress * 100)}%`);
            }
          }
        });

        setStatus('완료!');
        onComplete(text);
      } catch (error) {
        onError(error as Error);
      }
    };

    processImage();
  }, [imageFile, onComplete, onError]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">OCR 처리 중</h2>
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
      </div>
    </div>
  );
}