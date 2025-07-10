'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

interface TastingNote {
  id: string;
  title: string;
  date: string;
  country?: string;
  farm?: string;
  region?: string;
  variety?: string;
  altitude?: string;
  process?: string;
  cup_notes?: string;
  store_info?: string;
  ratings: {
    aroma: number;
    flavor: number;
    acidity: number;
    sweetness: number;
    body: number;
    aftertaste: number;
    balance: number;
    overall: number;
  };
  notes?: string;
  extracted_text?: string;
  created_at: string;
}

function NotesPageContent() {
  const [notes, setNotes] = useState<TastingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
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
        setNotes(notes.filter(note => note.id !== id));
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('노트 삭제 중 오류가 발생했습니다.');
    }
  };

  const editNote = (id: string) => {
    router.push(`/edit-note/${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-green-500';
    if (rating >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
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
            <button
              onClick={() => router.push('/capture')}
              className="flex items-center bg-emerald-800 text-white px-4 py-2 rounded-xl hover:bg-emerald-900 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              추가
            </button>
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
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 border border-stone-100"
              onClick={() => editNote(note.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{note.title}</h3>
                  <p className="text-sm text-stone-500 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
                    </svg>
                    {formatDate(note.created_at)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editNote(note.id);
                    }}
                    className="text-emerald-700 hover:text-emerald-900 text-sm font-medium px-3 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id, note.title);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {note.country && (
                  <div className="flex items-center text-sm text-stone-600">
                    <svg className="w-4 h-4 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">국가:</span>
                    <span className="ml-1">{note.country}</span>
                  </div>
                )}

                {note.farm && (
                  <div className="flex items-center text-sm text-stone-600">
                    <svg className="w-4 h-4 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-medium">농장:</span>
                    <span className="ml-1">{note.farm}</span>
                  </div>
                )}

                {note.variety && (
                  <div className="flex items-center text-sm text-stone-600">
                    <svg className="w-4 h-4 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium">품종:</span>
                    <span className="ml-1">{note.variety}</span>
                  </div>
                )}

                {note.cup_notes && (
                  <div className="flex items-start text-sm text-stone-600 mt-3">
                    <svg className="w-4 h-4 mr-2 text-stone-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <div>
                      <span className="font-medium">컵노트:</span>
                      <span className="ml-1 block mt-1">{note.cup_notes}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-stone-700">평가</h4>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-emerald-800">{note.ratings.overall}</span>
                    <span className="text-sm text-stone-400">/10</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(note.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-stone-600">
                        {key === 'aroma' && '향'}
                        {key === 'flavor' && '맛'}
                        {key === 'acidity' && '산미'}
                        {key === 'sweetness' && '단맛'}
                        {key === 'body' && '바디'}
                        {key === 'aftertaste' && '여운'}
                        {key === 'balance' && '균형'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${getRatingColor(value)}`} />
                        <span className="font-medium text-stone-700">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {note.notes && (
                <div className="border-t border-stone-100 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-stone-700 mb-2">추가 노트</h4>
                  <p className="text-sm text-stone-700 bg-stone-50 p-3 rounded-lg">
                    {note.notes}
                  </p>
                </div>
              )}

              {note.extracted_text && (
                <details className="border-t pt-4">
                  <summary className="text-sm text-gray-500 cursor-pointer font-medium">
                    추출된 텍스트 보기
                  </summary>
                  <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-3 rounded-lg">
                    {note.extracted_text}
                  </p>
                </details>
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