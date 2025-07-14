'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { TastingNote } from '@/types';
import { transformSupabaseToTastingNote } from '@/lib/data-transformers';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

interface FeedNote extends TastingNote {
  user_profile: {
    username: string;
    display_name: string;
  };
  user_id: string;
}

function FeedPage() {
  const { user } = useAuth();
  const [feedNotes, setFeedNotes] = useState<FeedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFeedNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchFeedNotes = async () => {
    try {
      console.log('🔍 Starting feed fetch for user:', user?.id);
      
      // 먼저 친구 ID 목록 가져오기
      const friendIds = await getFriendIds();
      
      console.log('📋 Friend IDs:', friendIds);
      
      // 내 노트와 친구들의 노트를 모두 포함할 사용자 ID 목록 생성
      const allUserIds = [user?.id, ...friendIds].filter(Boolean) as string[];
      
      console.log('👥 All user IDs for feed:', allUserIds);

      if (allUserIds.length === 0) {
        console.warn('⚠️ No user IDs to query');
        setFeedNotes([]);
        return;
      }

      // Simple query without profile join first
      console.log('🔍 Executing simple query with user IDs:', allUserIds);
      let { data, error } = await supabase
        .from('tasting_notes')
        .select('*')
        .in('user_id', allUserIds)
        .not('ratings', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);
      
      console.log('📊 Query result - Data:', data);
      console.log('📊 Query result - Error:', error);

      if (error) {
        console.error('❌ Simple query failed:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // Fallback: Try just my notes
        console.log('🔄 Fallback: Testing just my notes...');
        const { data: myData, error: myError } = await supabase
          .from('tasting_notes')
          .select('id, title, user_id, ratings')
          .eq('user_id', user?.id)
          .limit(5);
        
        console.log('🔍 My notes result:', myData);
        console.log('🔍 My notes error:', myError);
        
        setFeedNotes([]);
        return;
      }

      // If we have data, try to get profiles separately
      if (data && data.length > 0) {
        console.log('✅ Got notes, fetching profiles separately...');
        const userIds = [...new Set(data.map(note => note.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, display_name')
          .in('id', userIds);

        console.log('👤 Profiles fetched:', profiles);

        // Attach profiles to notes
        data = data.map(note => ({
          ...note,
          user_profile: profiles?.find(p => p.id === note.user_id) || {
            username: `user_${note.user_id.substring(0, 8)}`,
            display_name: 'Unknown User'
          }
        }));
      }

      console.log('📊 Final data before transform:', data);
      console.log(`📊 Found ${data?.length || 0} notes`);
      
      const transformedNotes = (data || [])
        .map(note => {
          console.log('🔍 Processing note:', {
            id: note.id,
            title: note.title,
            user_id: note.user_id,
            user_profile: note.user_profile,
            ratings: note.ratings
          });
          
          // Handle missing profile gracefully
          const userProfile = note.user_profile || {
            username: `user_${note.user_id?.substring(0, 8) || 'unknown'}`,
            display_name: 'Unknown User'
          };
          
          return {
            ...transformSupabaseToTastingNote(note),
            user_profile: userProfile,
            user_id: note.user_id
          };
        }) as FeedNote[];
      
      console.log('✅ Transformed notes:', transformedNotes);
      console.log(`✅ Final feed contains ${transformedNotes.length} notes`);
      setFeedNotes(transformedNotes);

    } catch (error) {
      console.error('💥 Unexpected error fetching feed notes:', error);
      setFeedNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const getFriendIds = async (): Promise<string[]> => {
    try {
      console.log('Fetching friends for user:', user?.id);
      
      const { data, error } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user?.id);

      if (error) {
        console.error('Error fetching friend IDs:', error);
        return [];
      }

      const friendIds = (data || []).map(friend => friend.friend_id);
      console.log('Found friend IDs:', friendIds);
      return friendIds;
    } catch (error) {
      console.error('Error fetching friend IDs:', error);
      return [];
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-emerald-600';
    if (rating >= 6) return 'text-blue-600';
    if (rating >= 4) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getRatingEmoji = (rating: number) => {
    if (rating >= 9) return '🤩';
    if (rating >= 8) return '😍';
    if (rating >= 7) return '😊';
    if (rating >= 6) return '🙂';
    if (rating >= 5) return '😐';
    if (rating >= 4) return '😕';
    return '😞';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gray-50 border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">
            Feed
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-sm">피드 로딩 중...</div>
          </div>
        ) : feedNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4 text-sm">
              아직 피드에 표시할 커피 기록이 없습니다
            </div>
            <div className="space-y-2">
              <Link 
                href="/add-note"
                className="block text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
              >
                첫 번째 커피를 기록해보세요
              </Link>
              <Link 
                href="/friends"
                className="block text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
              >
                또는 친구를 추가해보세요
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {feedNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* 사용자 정보 */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-emerald-800 font-medium text-sm">
                      {note.user_profile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      @{note.user_profile.username || 'unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(note.created_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {/* 전체 평점 */}
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getRatingEmoji(note.ratings.overall)}</span>
                    <span className={`text-lg font-bold ${getRatingColor(note.ratings.overall)}`}>
                      {note.ratings.overall}/10
                    </span>
                  </div>
                </div>

                {/* 커피 정보 */}
                <Link href={note.user_id === user?.id ? `/note/${note.id}` : `/friends/${note.user_id}/notes/${note.id}`} className="block hover:bg-gray-50 -m-2 p-2 rounded-lg transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {note.title}
                  </h3>
                  
                  <div className="text-sm text-gray-600 mb-3 space-y-1">
                    {(note.country || note.region) && (
                      <div className="flex items-center">
                        <span className="mr-2">🌍</span>
                        <span>
                          {note.country}{note.region && note.country && ', '}{note.region}
                        </span>
                      </div>
                    )}
                    {note.variety && (
                      <div className="flex items-center">
                        <span className="mr-2">🌱</span>
                        <span>{note.variety}</span>
                      </div>
                    )}
                    {note.process && (
                      <div className="flex items-center">
                        <span className="mr-2">⚙️</span>
                        <span>{note.process}</span>
                      </div>
                    )}
                  </div>

                  {/* 컵 노트 */}
                  {note.cup_notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        💫 {note.cup_notes}
                      </p>
                    </div>
                  )}

                  {/* 세부 평점 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">향미</span>
                      <span className={`font-medium ${getRatingColor(note.ratings.aroma)}`}>
                        {note.ratings.aroma}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">맛</span>
                      <span className={`font-medium ${getRatingColor(note.ratings.flavor)}`}>
                        {note.ratings.flavor}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">산미</span>
                      <span className={`font-medium ${getRatingColor(note.ratings.acidity)}`}>
                        {note.ratings.acidity}/10
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">바디</span>
                      <span className={`font-medium ${getRatingColor(note.ratings.body)}`}>
                        {note.ratings.body}/10
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Feed() {
  return (
    <ProtectedRoute>
      <FeedPage />
    </ProtectedRoute>
  );
}