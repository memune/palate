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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">
            Notes
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-sm mb-6">저장된 노트가 없습니다</p>
            <button
              onClick={() => router.push('/capture')}
              className="bg-emerald-800 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-900 transition-colors text-sm"
            >
              첫 번째 노트 작성하기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id} 
              className="border-b border-gray-100 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/note/${note.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-emerald-800 transition-colors">{note.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{formatDate(note.created_at)}</span>
                    {note.country && <span>{note.country}</span>}
                    {note.variety && <span>{note.variety}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-light text-emerald-800">{note.ratings.overall}</div>
                </div>
              </div>
              {note.cup_notes && (
                <p className="text-sm text-gray-600 line-clamp-1 mt-2">{note.cup_notes}</p>
              )}
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