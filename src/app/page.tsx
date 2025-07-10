'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

function HomePage() {
  const { user, signOut } = useAuth();
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentNotes();
    }
  }, [user]);

  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching recent notes:', error);
      } else {
        setRecentNotes(data || []);
      }
    } catch (error) {
      console.error('Error fetching recent notes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-gray-900 tracking-wide">
                ☕ Palate
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1 rounded-md hover:bg-gray-50"
                >
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

        {/* Main CTA */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              마신 커피 기록하기
            </h2>
            <p className="text-gray-600 mb-6">
              매장에서 받은 컵노트를 촬영하면 AI가 자동으로 분석해서 내용을 추출합니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/capture"
                className="inline-flex items-center bg-emerald-800 text-white px-8 py-3 rounded-lg hover:bg-emerald-900 transition-colors font-medium"
              >
                <span className="mr-2">📷</span>
                사진으로 기록하기
              </Link>
              <Link 
                href="/add-note"
                className="inline-flex items-center bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <span className="mr-2">✏️</span>
                직접 입력하기
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              최근 기록
            </h3>
            <Link 
              href="/notes"
              className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
            >
              전체 노트 보기 →
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                아직 기록된 노트가 없습니다
              </div>
              <Link 
                href="/capture"
                className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
              >
                첫 번째 커피를 기록해보세요 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNotes.map((note) => (
                <div key={note.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {note.title}
                      </h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        {note.country && <span className="block">📍 {note.country}</span>}
                        {note.cup_notes && <span className="block">☕ {note.cup_notes}</span>}
                        <span className="block text-xs text-gray-500">
                          {new Date(note.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-emerald-800">
                        {note.ratings?.overall || 0}/10
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}