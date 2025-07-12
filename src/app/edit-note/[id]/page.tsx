'use client';

import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { showError } from '@/lib/error-handler';
import { useTastingNote, useUpdateTastingNote } from '@/hooks/useTastingNotesQuery';

// Lazy load form components
const TastingNoteForm = lazy(() => import('@/components/forms/TastingNoteForm'));
const FloatingSubmitButton = lazy(() => import('@/components/ui/FloatingSubmitButton'));

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function EditNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { data: note, isLoading, error } = useTastingNote(params.id as string);
  const updateNoteMutation = useUpdateTastingNote();

  const initialData = note ? {
    title: note.title || '',
    date: note.date || new Date().toISOString().split('T')[0],
    country: note.country || '',
    farm: note.farm || '',
    region: note.region || '',
    variety: note.variety || '',
    altitude: note.altitude || '',
    process: note.process || '',
    cup_notes: note.cup_notes || '',
    store_info: note.store_info || '',
    ratings: note.ratings,
    notes: note.notes || '',
  } : null;

  const handleSubmit = useCallback(async (formData: any) => {
    if (!user || !params.id) return;

    try {
      await updateNoteMutation.mutateAsync({ 
        id: params.id as string, 
        note: formData 
      });
      router.push('/notes');
    } catch (error) {
      showError(error, 'updateNote');
    }
  }, [user, params.id, router, updateNoteMutation]);

  if (isLoading) {
    return <LoadingSpinner message="노트를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">노트를 불러오는 중 오류가 발생했습니다.</p>
          <button 
            onClick={() => router.push('/notes')}
            className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-lg"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-medium text-stone-900 tracking-tight">노트 편집</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {initialData && (
          <Suspense fallback={<LoadingSpinner message="폼 로딩 중..." />}>
            <TastingNoteForm
              mode="edit"
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={updateNoteMutation.isPending}
            />
            
            <FloatingSubmitButton
              formId="tasting-note-form"
              loading={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? '수정 중...' : '테이스팅 노트 수정'}
            </FloatingSubmitButton>
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default function EditNote() {
  return (
    <ProtectedRoute>
      <EditNotePage />
    </ProtectedRoute>
  );
}