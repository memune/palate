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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800 mx-auto mb-4"></div>
          <p className="text-gray-600">노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← 홈
          </button>
          <h1 className="text-lg font-semibold text-gray-900">저장된 노트</h1>
          <button
            onClick={() => router.push('/capture')}
            className="text-gray-600 hover:text-gray-900"
          >
            + 추가
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">저장된 테이스팅 노트가 없습니다.</p>
            <button
              onClick={() => router.push('/capture')}
              className="bg-emerald-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-900 transition-colors"
            >
              첫 번째 노트 작성하기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div 
              key={note.id} 
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => editNote(note.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{note.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(note.created_at)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      editNote(note.id);
                    }}
                    className="text-emerald-600 hover:text-emerald-800 text-sm font-medium px-2 py-1 rounded hover:bg-emerald-50"
                  >
                    수정
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id, note.title);
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>

              {note.country && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">📍 국가:</span> {note.country}
                </p>
              )}

              {note.farm && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">🏡 농장:</span> {note.farm}
                </p>
              )}

              {note.region && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">🗺️ 지역:</span> {note.region}
                </p>
              )}

              {note.variety && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">🌱 품종:</span> {note.variety}
                </p>
              )}

              {note.process && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">⚙️ 가공:</span> {note.process}
                </p>
              )}

              {note.cup_notes && (
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">☕ 컵노트:</span> {note.cup_notes}
                </p>
              )}

              {note.store_info && (
                <p className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">🏪 매장:</span> {note.store_info}
                </p>
              )}

              <div className="border-t pt-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">평가</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(note.ratings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {key === 'aroma' && '향'}
                        {key === 'flavor' && '맛'}
                        {key === 'acidity' && '산미'}
                        {key === 'sweetness' && '단맛'}
                        {key === 'body' && '바디'}
                        {key === 'aftertaste' && '여운'}
                        {key === 'balance' && '균형'}
                        {key === 'overall' && '전체'}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getRatingColor(value)}`} />
                        <span className="text-sm font-medium text-emerald-800">{value}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {note.notes && (
                <div className="border-t pt-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">추가 노트</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
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