'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase';

function SimpleAddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!user) {
      setMessage('로그인이 필요합니다.');
      return;
    }

    if (!title.trim()) {
      setMessage('제목을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    setMessage('저장 중...');

    try {
      // 직접 Supabase에 저장
      const { data, error } = await supabase
        .from('tasting_notes')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          date: new Date().toISOString(),
          country: null,
          farm: null,
          region: null,
          variety: null,
          altitude: null,
          process: null,
          cup_notes: null,
          store_info: null,
          ratings: {
            overall: 0,
            aroma: 0,
            flavor: 0,
            aftertaste: 0,
            acidity: 0,
            body: 0,
            balance: 0,
            sweetness: 0
          },
          notes: notes.trim() || null,
          image_url: null,
          extracted_text: null
        }])
        .select()
        .single();

      if (error) {
        console.error('저장 에러:', error);
        setMessage('저장 실패: ' + error.message);
        setIsSaving(false);
        return;
      }

      console.log('저장 성공:', data);
      setMessage('저장 완료! 이동 중...');
      
      // 즉시 이동
      router.push(`/note/${data.id}`);
      
    } catch (error: any) {
      console.error('예외 발생:', error);
      setMessage('저장 실패: ' + error.message);
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-xl font-bold mb-4">간단한 노트 추가</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="노트 제목을 입력하세요"
            disabled={isSaving}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">메모</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 h-24"
            placeholder="메모를 입력하세요"
            disabled={isSaving}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>

        {message && (
          <div className="mt-4 p-2 bg-blue-50 text-blue-700 rounded">
            {message}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700"
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SimpleAddNote() {
  return (
    <ProtectedRoute>
      <SimpleAddNotePage />
    </ProtectedRoute>
  );
}