'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

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
        setNote({
          id: data.id,
          title: data.title,
          date: data.date || data.created_at,
          country: data.country,
          farm: data.farm,
          region: data.region,
          variety: data.variety,
          altitude: data.altitude,
          process: data.process,
          cup_notes: data.cup_notes,
          store_info: data.store_info,
          ratings: data.ratings,
          notes: data.notes,
          extracted_text: data.extracted_text,
          created_at: data.created_at,
        });
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      router.push('/notes');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'bg-emerald-500';
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
            <Link
              href={`/edit-note/${noteId}`}
              className="flex items-center bg-emerald-800 text-white px-4 py-2 rounded-xl hover:bg-emerald-900 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              수정
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Title and Date */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-light text-stone-900 mb-3 tracking-tight">{note.title}</h2>
            <p className="text-stone-500 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6m2 5H7a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2z" />
              </svg>
              {formatDate(note.created_at)}
            </p>
          </div>
          
          {/* Overall Rating */}
          <div className="text-center border-t border-stone-100 pt-6">
            <div className="inline-flex items-center bg-stone-50 rounded-2xl px-6 py-4">
              <span className="text-stone-600 mr-3">전체 평가</span>
              <span className="text-4xl font-light text-emerald-800">{note.ratings.overall}</span>
              <span className="text-stone-400 ml-1">/10</span>
            </div>
          </div>
        </div>

        {/* Coffee Information */}
        {(note.country || note.farm || note.region || note.variety || note.altitude || note.process) && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-900 mb-6">커피 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {note.country && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">국가</p>
                    <p className="font-medium text-stone-900">{note.country}</p>
                  </div>
                </div>
              )}
              
              {note.farm && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">농장</p>
                    <p className="font-medium text-stone-900">{note.farm}</p>
                  </div>
                </div>
              )}

              {note.region && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">지역</p>
                    <p className="font-medium text-stone-900">{note.region}</p>
                  </div>
                </div>
              )}

              {note.variety && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">품종</p>
                    <p className="font-medium text-stone-900">{note.variety}</p>
                  </div>
                </div>
              )}

              {note.altitude && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">고도</p>
                    <p className="font-medium text-stone-900">{note.altitude}</p>
                  </div>
                </div>
              )}

              {note.process && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-stone-500">가공 방식</p>
                    <p className="font-medium text-stone-900">{note.process}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cup Notes */}
        {note.cup_notes && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              컵노트
            </h3>
            <p className="text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl">{note.cup_notes}</p>
          </div>
        )}

        {/* Detailed Ratings */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
          <h3 className="text-lg font-semibold text-stone-900 mb-6">세부 평가</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(note.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                <span className="font-medium text-stone-700">
                  {key === 'aroma' && '향 (Aroma)'}
                  {key === 'flavor' && '맛 (Flavor)'}
                  {key === 'acidity' && '산미 (Acidity)'}
                  {key === 'sweetness' && '단맛 (Sweetness)'}
                  {key === 'body' && '바디 (Body)'}
                  {key === 'aftertaste' && '여운 (Aftertaste)'}
                  {key === 'balance' && '균형 (Balance)'}
                </span>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getRatingColor(value)}`} />
                  <span className="text-lg font-semibold text-stone-900">{value}<span className="text-stone-400 text-sm">/10</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        {note.notes && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">추가 노트</h3>
            <p className="text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl">{note.notes}</p>
          </div>
        )}

        {/* Store Info */}
        {note.store_info && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              매장 정보
            </h3>
            <p className="text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl">{note.store_info}</p>
          </div>
        )}

        {/* Extracted Text */}
        {note.extracted_text && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-stone-100">
            <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              추출된 텍스트
            </h3>
            <div className="bg-stone-50 p-4 rounded-xl">
              <pre className="text-stone-700 text-sm whitespace-pre-wrap font-mono">{note.extracted_text}</pre>
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