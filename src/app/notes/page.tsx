'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TastingNote } from '@/types';

export default function NotesPage() {
  const [notes, setNotes] = useState<TastingNote[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('tastingNotes') || '[]');
    setNotes(savedNotes);
  }, []);

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('tastingNotes', JSON.stringify(updatedNotes));
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
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              첫 번째 노트 작성하기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                  <p className="text-sm text-gray-500">{formatDate(note.date)}</p>
                </div>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>

              {note.origin && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">원산지:</span> {note.origin}
                </p>
              )}

              {note.brewery && (
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">로스터:</span> {note.brewery}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 mb-3">
                {Object.entries(note.ratings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {key === 'aroma' && '향'}
                      {key === 'acidity' && '산미'}
                      {key === 'sweetness' && '단맛'}
                      {key === 'body' && '바디'}
                      {key === 'flavor' && '맛'}
                      {key === 'aftertaste' && '여운'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${getRatingColor(value)}`} />
                      <span className="text-sm font-medium">{value}/10</span>
                    </div>
                  </div>
                ))}
              </div>

              {note.notes && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {note.notes}
                </p>
              )}

              {note.extractedText && (
                <details className="mt-3">
                  <summary className="text-sm text-gray-500 cursor-pointer">
                    추출된 텍스트 보기
                  </summary>
                  <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded">
                    {note.extractedText}
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