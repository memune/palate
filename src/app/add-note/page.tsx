'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Toast from '@/components/ui/Toast';
import { showError } from '@/lib/error-handler';
import { useCreateTastingNote } from '@/hooks/useTastingNotesQuery';

// Lazy load form components
const TastingNoteForm = lazy(() => import('@/components/forms/TastingNoteForm'));

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function AddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const createNoteMutation = useCreateTastingNote();
  
  // 새로운 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = useCallback(async (formData: any) => {
    console.log('=== handleSubmit 호출됨 ===');
    console.log('user 존재:', !!user);
    console.log('isSubmitting:', isSubmitting);
    
    if (!user || isSubmitting) {
      console.log('조건 불만족으로 리턴');
      return;
    }

    console.log('저장 프로세스 시작');
    setIsSubmitting(true);
    setShowErrorToast(false);

    try {
      console.log('=== 저장 시작 ===');
      console.log('formData:', formData);
      
      // 노트 저장 - 간단한 테스트
      console.log('createNoteMutation 상태:', createNoteMutation);
      
      // 임시로 간단한 데이터만 저장해보기
      const testData = {
        title: formData.title || '테스트 노트',
        country: formData.country || '',
        notes: formData.notes || '테스트 내용'
      };
      console.log('테스트 데이터:', testData);
      
      const newNote = await createNoteMutation.mutateAsync(testData);
      console.log('저장 성공:', newNote);
      
      // 즉시 리다이렉트 (토스트 없이 테스트)
      console.log('즉시 리다이렉트:', `/note/${newNote.id}`);
      router.push(`/note/${newNote.id}`);
      
    } catch (error: any) {
      console.error('저장 실패:', error);
      setIsSubmitting(false);
      setErrorMessage(error?.message || '노트 저장에 실패했습니다. 다시 시도해주세요.');
      setShowErrorToast(true);
    }
  }, [user, router, createNoteMutation, isSubmitting]);

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
        <Suspense fallback={<LoadingSpinner message="폼 로딩 중..." />}>
          <TastingNoteForm
            mode="create"
            onSubmit={handleSubmit}
            loading={isSubmitting}
            submitButtonText={isSubmitting ? '저장 중...' : '테이스팅 노트 저장'}
          />
        </Suspense>
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