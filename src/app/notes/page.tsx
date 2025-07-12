'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { formatDate, getRatingColor } from '@/lib/formatters';
import { useTastingNotes, useDeleteTastingNote } from '@/hooks/useTastingNotesQuery';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';


function NotesPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: notes = [], isLoading, error } = useTastingNotes();
  const deleteNoteMutation = useDeleteTastingNote();



  const handleDeleteNote = async (noteId: string) => {
    if (confirm('정말로 이 노트를 삭제하시겠습니까?')) {
      try {
        await deleteNoteMutation.mutateAsync(noteId);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="노트를 불러오는 중..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">노트를 불러오는 중 오류가 발생했습니다.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-emerald-800 text-white rounded-lg"
          >
            다시 시도
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
              onClick={() => router.push('/')}
              className="flex items-center text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              홈
            </button>
            <h1 className="text-xl font-medium text-stone-900 tracking-tight">저장된 노트</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {notes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-stone-500 mb-6">
              <svg className="w-16 h-16 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg mb-2">저장된 테이스팅 노트가 없습니다</p>
              <p className="text-sm text-stone-400">첫 번째 커피 노트를 작성해보세요</p>
            </div>
            <button
              onClick={() => router.push('/capture')}
              className="bg-emerald-800 text-white px-8 py-3 rounded-xl font-medium hover:bg-emerald-900 transition-colors"
            >
              첫 번째 노트 작성하기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id} 
              className="bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/note/${note.id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-stone-900 mb-2 hover:text-emerald-800 transition-colors">{note.title}</h3>
                    <p className="text-sm text-stone-500 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                      </svg>
                      {formatDate(note.created_at)}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-light text-emerald-800">{note.ratings.overall}</div>
                    <div className="text-xs text-stone-500">전체 평가</div>
                  </div>
                </div>

                {/* Basic info in one line */}
                <div className="flex items-center space-x-4 mb-3 text-sm text-stone-600">
                  {note.country && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{note.country}</span>
                    </div>
                  )}
                  {note.variety && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>{note.variety}</span>
                    </div>
                  )}
                </div>

                {/* Cup notes preview */}
                {note.cup_notes && (
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <p className="text-sm text-stone-700 line-clamp-2">{note.cup_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesPageContent />
    </ProtectedRoute>
  );
}