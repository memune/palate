'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Camera from '@/components/camera/CameraCapture';
import OCRProcessor from '@/components/OCRProcessor';
import TastingForm from '@/components/TastingForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTastingNotes } from '@/hooks/useTastingNotes';
import { TastingNote } from '@/types';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function CapturePageContent() {
  const [step, setStep] = useState<'camera' | 'ocr' | 'form'>('camera');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const router = useRouter();
  const { saveNote } = useTastingNotes();

  const handleCapture = useCallback((file: File) => {
    setCapturedImage(file);
    setStep('ocr');
  }, []);

  const handleOCRComplete = useCallback((text: string) => {
    setExtractedText(text);
    setStep('form');
  }, []);

  const handleFormSubmit = useCallback(async (note: Partial<TastingNote>) => {
    try {
      const noteData = {
        ...note,
        extractedText,
        ratings: note.ratings || {
          aroma: 5,
          flavor: 5,
          acidity: 5,
          sweetness: 5,
          body: 5,
          aftertaste: 5,
          balance: 5,
          overall: 5,
        },
      };

      await saveNote(noteData);
      router.push('/notes');
    } catch (error) {
      console.error('노트 저장 실패:', error);
      alert('노트 저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [extractedText, router, saveNote]);

  const handleBack = useCallback(() => {
    if (step === 'ocr') {
      setStep('camera');
      setCapturedImage(null);
    } else if (step === 'form') {
      setStep('ocr');
    } else {
      router.push('/');
    }
  }, [step, router]);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>
            <h1 className="text-xl font-medium text-stone-900 tracking-tight">
              {step === 'camera' && '사진 촬영'}
              {step === 'ocr' && 'OCR 처리중'}
              {step === 'form' && '테이스팅 노트 작성'}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {step === 'camera' && (
          <Camera onCapture={handleCapture} onClose={() => router.push('/')} />
        )}
        
        {step === 'ocr' && capturedImage && (
          <OCRProcessor 
            imageFile={capturedImage} 
            onComplete={handleOCRComplete}
            onError={(error) => {
              console.error('OCR Error:', error);
              setStep('form');
            }}
          />
        )}
        
        {step === 'form' && (
          <TastingForm 
            extractedText={extractedText}
            onSubmit={handleFormSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default function CapturePage() {
  return (
    <ProtectedRoute>
      <CapturePageContent />
    </ProtectedRoute>
  );
}