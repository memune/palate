'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Toast from '@/components/ui/Toast';
import OptimizedTastingNoteForm from '@/components/forms/OptimizedTastingNoteForm';
import { supabase } from '@/lib/supabase';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function AddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(async (formData: any) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    setShowErrorToast(false);

    try {
      // 직접 Supabase에 저장 (React Query 우회)
      const noteData = {
        user_id: user.id,
        title: formData.title || '새 테이스팅 노트',
        date: formData.date || new Date().toISOString(),
        extracted_text: formData.extracted_text || null,
        country: formData.country || null,
        farm: formData.farm || null,
        region: formData.region || null,
        variety: formData.variety || null,
        altitude: formData.altitude || null,
        process: formData.process || null,
        cup_notes: formData.cup_notes || null,
        store_info: formData.store_info || null,
        ratings: formData.ratings || {
          overall: 0,
          aroma: 0,
          flavor: 0,
          aftertaste: 0,
          acidity: 0,
          body: 0,
          balance: 0,
          sweetness: 0
        },
        notes: formData.notes || null,
        image_url: formData.image_url || null,
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
        router.push('/');
      }, 1000);
      
    } catch (error: any) {
      setIsSubmitting(false);
      setErrorMessage(error?.message || '노트 저장에 실패했습니다. 다시 시도해주세요.');
      setShowErrorToast(true);
    }
  }, [user, router, isSubmitting]);

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>
            <div className="w-16" />
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <OptimizedTastingNoteForm
          mode="create"
          onSubmit={handleSubmit}
          loading={isSubmitting}
        />
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

export default function AddNote() {
  return (
    <ProtectedRoute>
      <AddNotePage />
    </ProtectedRoute>
  );
}