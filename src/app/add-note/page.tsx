'use client';

import { useState, useCallback, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
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
  
  console.log('=== AddNotePage 렌더링됨 ===');
  console.log('user:', user);
  console.log('createNoteMutation:', createNoteMutation);

  const handleSubmit = useCallback(async (formData: any) => {
    console.log('=== add-note handleSubmit 호출됨 ===');
    console.log('user:', user);
    console.log('formData:', formData);
    
    if (!user) {
      console.log('user가 없어서 리턴');
      return;
    }

    try {
      console.log('createNoteMutation.mutateAsync 호출 시작');
      const newNote = await createNoteMutation.mutateAsync(formData);
      console.log('생성된 노트:', newNote);
      console.log('리다이렉트할 ID:', newNote.id);
      console.log('router.push 호출:', `/note/${newNote.id}`);
      router.push(`/note/${newNote.id}`);
      console.log('router.push 완료');
    } catch (error) {
      console.error('에러 발생:', error);
      showError(error, 'saveNote');
    }
  }, [user, router, createNoteMutation]);

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
            loading={createNoteMutation.isPending}
          />
        </Suspense>
      </main>
    </div>
  );
}

export default function AddNote() {
  console.log('=== AddNote 컴포넌트 렌더링 ===');
  
  // 글로벌 에러 캐칭
  window.addEventListener('error', (e) => {
    console.error('글로벌 JavaScript 에러:', e.error);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('처리되지 않은 Promise 거부:', e.reason);
  });
  
  return (
    <ProtectedRoute>
      <AddNotePage />
    </ProtectedRoute>
  );
}