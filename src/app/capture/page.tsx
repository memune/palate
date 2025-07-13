'use client';

import { useState, useCallback, lazy, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import OptimizedTastingNoteForm from '@/components/forms/OptimizedTastingNoteForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { extractCoffeeDataFromText } from '@/utils/coffeeDataExtractor';
import { ExtractedCoffeeData } from '@/types';

// Lazy load heavy components
const Camera = lazy(() => import('@/components/camera/CameraCapture'));
const OCRProcessor = lazy(() => import('@/components/OCRProcessor'));

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function CapturePageContent() {
  const [step, setStep] = useState<'camera' | 'ocr' | 'form'>('camera');
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedCoffeeData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // 새로운 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();
  const { user } = useAuth();

  const handleCapture = useCallback((file: File) => {
    setCapturedImage(file);
    setStep('ocr');
  }, []);

  const handleOCRComplete = useCallback(async (text: string) => {
    setExtractedText(text);
    setStep('form');
    
    // OCR 텍스트에서 자동으로 필드 추출
    if (text && text.trim()) {
      setIsExtracting(true);
      try {
        const extracted = await extractCoffeeDataFromText(text);
        setExtractedData(extracted);
      } catch (error) {
        console.error('자동 필드 추출 실패:', error);
      } finally {
        setIsExtracting(false);
      }
    }
  }, []);

  const handleFormSubmit = useCallback(async (note: any) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    setShowErrorToast(false);

    try {
      // 직접 Supabase에 저장 (React Query 우회)
      const noteData = {
        user_id: user.id,
        title: note.title || '새 테이스팅 노트',
        date: note.date || new Date().toISOString(),
        extracted_text: extractedText,
        country: note.country || null,
        farm: note.farm || null,
        region: note.region || null,
        variety: note.variety || null,
        altitude: note.altitude || null,
        process: note.process || null,
        cup_notes: note.cup_notes || null,
        store_info: note.store_info || null,
        ratings: note.ratings || {
          overall: 0,
          aroma: 0,
          flavor: 0,
          aftertaste: 0,
          acidity: 0,
          body: 0,
          balance: 0,
          sweetness: 0
        },
        notes: note.notes || null,
        image_url: note.image_url || null,
      };

      const { data, error } = await supabase
        .from('tasting_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 성공 토스트 표시
      setShowSuccessToast(true);
      
      // 1초 후 리다이렉트
      setTimeout(() => {
        setIsSubmitting(false); // 리다이렉트 직전에 loading 상태 해제
        router.push(`/note/${data.id}`);
      }, 1000);
      
    } catch (error: any) {
      setIsSubmitting(false);
      setErrorMessage(error?.message || '노트 저장에 실패했습니다. 다시 시도해주세요.');
      setShowErrorToast(true);
    }
  }, [extractedText, router, user, isSubmitting]);

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
          <Suspense fallback={<LoadingSpinner message="카메라 로딩 중..." />}>
            <Camera onCapture={handleCapture} onClose={() => router.push('/')} />
          </Suspense>
        )}
        
        {step === 'ocr' && capturedImage && (
          <Suspense fallback={<LoadingSpinner message="OCR 처리기 로딩 중..." />}>
            <OCRProcessor 
              imageFile={capturedImage} 
              onComplete={handleOCRComplete}
              onError={(error) => {
                console.error('OCR Error:', error);
                setStep('form');
              }}
            />
          </Suspense>
        )}
        
        {step === 'form' && (
          <Suspense fallback={<LoadingSpinner message="폼 로딩 중..." />}>
            {isExtracting && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-800 mr-3"></div>
                  <span className="text-emerald-800 font-medium">🤖 AI가 커피 정보를 자동으로 추출하고 있습니다...</span>
                </div>
              </div>
            )}
            <OptimizedTastingNoteForm 
              mode="create"
              initialData={extractedData ? {
                title: extractedData.title || '',
                country: extractedData.country || '',
                farm: extractedData.farm || '',
                region: extractedData.region || '',
                variety: extractedData.variety || '',
                altitude: extractedData.altitude || '',
                process: extractedData.process || '',
                cup_notes: extractedData.cupNotes || '',
                store_info: extractedData.storeInfo || '',
                notes: extractedText,
              } : { notes: extractedText }}
              onSubmit={handleFormSubmit}
              loading={isSubmitting}
            />
          </Suspense>
        )}
      </main>

      {/* 토스트 메시지들 */}
      <Toast
        message="노트가 성공적으로 저장되었습니다!"
        type="success"
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        duration={2000}
      />
      
      <Toast
        message={errorMessage}
        type="error"
        show={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        duration={4000}
      />
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