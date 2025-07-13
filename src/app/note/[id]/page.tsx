'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { TastingNote } from '@/types';
import { formatDate, getRatingColor } from '@/lib/formatters';
import { transformSupabaseToTastingNote } from '@/lib/data-transformers';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';


function NotePageContent() {
  const [note, setNote] = useState<TastingNote | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  useEffect(() => {
    if (user && noteId) {
      fetchNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, noteId]);

  const fetchNote = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        router.push('/notes');
        return;
      }

      if (data) {
        setNote(transformSupabaseToTastingNote(data));
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/notes');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string, title: string) => {
    if (!confirm(`"${title}" 노트를 정말 삭제하시겠습니까?\n삭제된 노트는 복구할 수 없습니다.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasting_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error deleting note:', error);
        alert('노트 삭제 중 오류가 발생했습니다.');
      } else {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('노트 삭제 중 오류가 발생했습니다.');
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800 mx-auto mb-4"></div>
          <p className="text-stone-600">노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">노트를 찾을 수 없습니다.</p>
          <Link 
            href="/notes"
            className="text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            노트 목록으로 돌아가기
          </Link>
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
            <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">Note</h1>
            <div className="flex items-center space-x-3">
              <Link
                href={`/edit-note/${noteId}`}
                className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
              >
                수정
              </Link>
              <button
                onClick={() => deleteNote(noteId, note.title)}
                className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Title and Rating */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-3">
            <h1 className="text-2xl font-light text-gray-900 tracking-tight flex-1">{note.title}</h1>
            <div className="text-right ml-4">
              <div className="text-2xl font-light text-emerald-800">{note.ratings.overall}</div>
            </div>
          </div>
          <p className="text-gray-500 text-sm">{formatDate(note.created_at)}</p>
        </div>

        {/* Coffee Information */}
        {(note.country || note.farm || note.region || note.variety || note.altitude || note.process) && (
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Origin</h2>
            <div className="space-y-2 text-sm">
              {note.country && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">국가</span>
                  <span className="text-gray-900">{note.country}</span>
                </div>
              )}
              {note.region && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">지역</span>
                  <span className="text-gray-900">{note.region}</span>
                </div>
              )}
              {note.farm && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">농장</span>
                  <span className="text-gray-900">{note.farm}</span>
                </div>
              )}
              {note.variety && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">품종</span>
                  <span className="text-gray-900">{note.variety}</span>
                </div>
              )}
              {note.altitude && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">고도</span>
                  <span className="text-gray-900">{note.altitude}</span>
                </div>
              )}
              {note.process && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">가공 방식</span>
                  <span className="text-gray-900">{note.process}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cup Notes */}
        {note.cup_notes && (
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Tasting Notes</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{note.cup_notes}</p>
          </div>
        )}

        {/* Detailed Ratings */}
        <div className="mb-8">
          <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Rating</h2>
          <div className="space-y-1 text-sm">
            {Object.entries(note.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-1">
                <span className="text-gray-500">
                  {key === 'aroma' && '향'}
                  {key === 'flavor' && '맛'}
                  {key === 'acidity' && '산미'}
                  {key === 'sweetness' && '단맛'}
                  {key === 'body' && '바디'}
                  {key === 'aftertaste' && '여운'}
                  {key === 'balance' && '균형'}
                </span>
                <span className="text-gray-900 font-light">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        {note.notes && (
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Notes</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{note.notes}</p>
          </div>
        )}

        {/* Store Info */}
        {note.store_info && (
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Store</h2>
            <p className="text-gray-700 text-sm">{note.store_info}</p>
          </div>
        )}

        {/* Extracted Text */}
        {note.extracted_text && (
          <div className="mb-8">
            <h2 className="text-base font-medium text-gray-900 mb-4 brand-font">Extracted Text</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-gray-600 text-xs whitespace-pre-wrap font-mono leading-relaxed">{note.extracted_text}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NotePage() {
  return (
    <ProtectedRoute>
      <NotePageContent />
    </ProtectedRoute>
  );
}