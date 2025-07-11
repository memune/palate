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
const FloatingSubmitButton = lazy(() => import('@/components/ui/FloatingSubmitButton'));

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function AddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const createNoteMutation = useCreateTastingNote();

  const handleSubmit = useCallback(async (formData: any) => {
    if (!user) return;

    try {
      await createNoteMutation.mutateAsync(formData);
      router.push('/notes');
    } catch (error) {
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
            <h1 className="text-xl font-medium text-stone-900 tracking-tight">직접 입력하기</h1>
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
          
          <FloatingSubmitButton
            formId="tasting-note-form"
            loading={createNoteMutation.isPending}
          >
            {createNoteMutation.isPending ? '저장 중...' : '테이스팅 노트 저장'}
          </FloatingSubmitButton>
        </Suspense>
      </main>
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