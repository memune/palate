'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && noteId) {
      fetchNote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, noteId]);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <Link
                    href={`/edit-note/${noteId}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      deleteNote(noteId, note.title);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-8">
        {/* Tasting Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 px-6 py-8 text-white">
            <div className="text-center">
              <h1 className="text-xl font-light tracking-wide mb-2 brand-font">{note.title}</h1>
              <div className="flex items-center justify-center space-x-4 text-sm opacity-90">
                <span>{formatDate(note.created_at)}</span>
                {note.store_info && <span>• {note.store_info}</span>}
              </div>
            </div>
          </div>


          <div className="px-6 py-6">
            {/* Origin Information */}
            {(note.country || note.region || note.farm || note.variety || note.altitude || note.process) && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 brand-font">Origin</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {note.country && (
                    <div>
                      <div className="text-xs text-gray-500">Country</div>
                      <div className="font-medium text-gray-900">{note.country}</div>
                    </div>
                  )}
                  {note.region && (
                    <div>
                      <div className="text-xs text-gray-500">Region</div>
                      <div className="font-medium text-gray-900">{note.region}</div>
                    </div>
                  )}
                  {note.farm && (
                    <div>
                      <div className="text-xs text-gray-500">Farm</div>
                      <div className="font-medium text-gray-900">{note.farm}</div>
                    </div>
                  )}
                  {note.variety && (
                    <div>
                      <div className="text-xs text-gray-500">Variety</div>
                      <div className="font-medium text-gray-900">{note.variety}</div>
                    </div>
                  )}
                  {note.altitude && (
                    <div>
                      <div className="text-xs text-gray-500">Altitude</div>
                      <div className="font-medium text-gray-900">{note.altitude}</div>
                    </div>
                  )}
                  {note.process && (
                    <div>
                      <div className="text-xs text-gray-500">Process</div>
                      <div className="font-medium text-gray-900">{note.process}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasting Notes */}
            {note.cup_notes && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 brand-font">Tasting Notes</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{note.cup_notes}</p>
              </div>
            )}

            {/* Rating */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 brand-font">Rating</h3>
              <div className="space-y-2">
                {/* Detailed ratings first */}
                {Object.entries(note.ratings).filter(([key]) => key !== 'overall').map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {key === 'aroma' && '향'}
                      {key === 'flavor' && '맛'}
                      {key === 'acidity' && '산미'}
                      {key === 'sweetness' && '단맛'}
                      {key === 'body' && '바디'}
                      {key === 'aftertaste' && '여운'}
                      {key === 'balance' && '균형'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
                {/* Overall rating at the bottom with emphasis */}
                <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-3">
                  <span className="text-sm text-gray-900 font-semibold">전체</span>
                  <span className="text-sm font-bold text-gray-900">{note.ratings.overall}</span>
                </div>
              </div>
            </div>

            {/* Personal Notes */}
            {note.notes && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 brand-font">Personal Notes</h3>
                <p className="text-sm text-gray-700 leading-relaxed italic">{note.notes}</p>
              </div>
            )}

            {/* Extracted Text - Minimized */}
            {note.extracted_text && (
              <div className="border-t border-gray-100 pt-4 mt-6">
                <details className="group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors">
                    OCR Text Data ▼
                  </summary>
                  <div className="mt-2 bg-gray-50 p-3 rounded-lg">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">{note.extracted_text}</pre>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
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