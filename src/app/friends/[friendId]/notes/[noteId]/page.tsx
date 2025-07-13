'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { TastingNote } from '@/types';
import { formatDate } from '@/lib/formatters';
import { transformSupabaseToTastingNote } from '@/lib/data-transformers';
import { useFriends } from '@/hooks/useFriendsQuery';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function FriendNotePageContent() {
  const [note, setNote] = useState<TastingNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const friendId = params.friendId as string;
  const noteId = params.noteId as string;

  const { data: friends = [] } = useFriends();
  const friend = friends.find(f => f.friend_id === friendId);

  useEffect(() => {
    if (friendId && noteId) {
      fetchNote();
    }
  }, [friendId, noteId]);

  const fetchNote = async () => {
    try {
      // First verify friendship
      const { data: friendship, error: friendshipError } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('friend_id', friendId)
        .single();

      if (friendshipError || !friendship) {
        setError('이 사용자와 친구가 아닙니다.');
        return;
      }

      // Get the note
      const { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', friendId)
        .single();

      if (error) {
        console.error('Error fetching friend note:', error);
        setError('노트를 찾을 수 없습니다.');
        return;
      }

      if (data) {
        setNote(transformSupabaseToTastingNote(data));
      }
    } catch (error) {
      console.error('Error fetching friend note:', error);
      setError('노트를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
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

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '노트를 찾을 수 없습니다.'}</p>
          <button
            onClick={() => router.push(`/friends/${friendId}/notes`)}
            className="text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            노트 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/friends/${friendId}/notes`)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>
            <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">
              {friend ? `@${friend.friend_profile.username}` : 'Friend Note'}
            </h1>
            <div className="w-16" />
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
              {friend && (
                <div className="mt-3 text-xs opacity-75">
                  by @{friend.friend_profile.username}
                </div>
              )}
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default function FriendNotePage() {
  return (
    <ProtectedRoute>
      <FriendNotePageContent />
    </ProtectedRoute>
  );
}