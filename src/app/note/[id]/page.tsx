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
            <h1 className="text-xl font-medium text-stone-900 tracking-tight">테이스팅 노트</h1>
            <div className="flex items-center space-x-2">
              <Link
                href={`/edit-note/${noteId}`}
                className="flex items-center bg-emerald-800 text-white px-4 py-2 rounded-xl hover:bg-emerald-900 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                수정
              </Link>
              <button
                onClick={() => deleteNote(noteId, note.title)}
                className="flex items-center bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors font-medium text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                삭제
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        {/* Title and Rating */}
        <div className="mb-12">
          <h1 className="text-4xl font-light text-stone-900 mb-4 tracking-tight">{note.title}</h1>
          <div className="flex items-center justify-between">
            <p className="text-stone-500">{formatDate(note.created_at)}</p>
            <div className="text-right">
              <div className="text-3xl font-light text-emerald-800">{note.ratings.overall}</div>
              <div className="text-sm text-stone-400">종합 평가</div>
            </div>
          </div>
        </div>

        {/* Coffee Information */}
        {(note.country || note.farm || note.region || note.variety || note.altitude || note.process) && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-stone-900 mb-6">커피 정보</h2>
            <div className="space-y-4">
              {note.country && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">국가</span>
                  <span className="text-stone-900">{note.country}</span>
                </div>
              )}
              {note.region && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">지역</span>
                  <span className="text-stone-900">{note.region}</span>
                </div>
              )}
              {note.farm && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">농장</span>
                  <span className="text-stone-900">{note.farm}</span>
                </div>
              )}
              {note.variety && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">품종</span>
                  <span className="text-stone-900">{note.variety}</span>
                </div>
              )}
              {note.altitude && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">고도</span>
                  <span className="text-stone-900">{note.altitude}</span>
                </div>
              )}
              {note.process && (
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-stone-500">가공 방식</span>
                  <span className="text-stone-900">{note.process}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cup Notes */}
        {note.cup_notes && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-stone-900 mb-6">컵노트</h2>
            <p className="text-stone-700 leading-relaxed text-lg">{note.cup_notes}</p>
          </div>
        )}

        {/* Detailed Ratings */}
        <div className="mb-12">
          <h2 className="text-xl font-light text-stone-900 mb-6">세부 평가</h2>
          <div className="space-y-3">
            {Object.entries(note.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="flex justify-between items-center py-3 border-b border-stone-100">
                <span className="text-stone-600">
                  {key === 'aroma' && '향'}
                  {key === 'flavor' && '맛'}
                  {key === 'acidity' && '산미'}
                  {key === 'sweetness' && '단맛'}
                  {key === 'body' && '바디'}
                  {key === 'aftertaste' && '여운'}
                  {key === 'balance' && '균형'}
                </span>
                <span className="text-stone-900 font-light">{value}/10</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        {note.notes && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-stone-900 mb-6">추가 노트</h2>
            <p className="text-stone-700 leading-relaxed text-lg">{note.notes}</p>
          </div>
        )}

        {/* Store Info */}
        {note.store_info && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-stone-900 mb-6">매장 정보</h2>
            <p className="text-stone-700">{note.store_info}</p>
          </div>
        )}

        {/* Extracted Text */}
        {note.extracted_text && (
          <div className="mb-12">
            <h2 className="text-xl font-light text-stone-900 mb-6">추출된 텍스트</h2>
            <div className="bg-stone-50 p-6 rounded-lg">
              <pre className="text-stone-600 text-sm whitespace-pre-wrap font-mono leading-relaxed">{note.extracted_text}</pre>
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