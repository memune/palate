'use client';

import { useRouter, useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useFriendTastingNotes, useFriends } from '@/hooks/useFriendsQuery';
import { formatDate } from '@/lib/formatters';
import { transformSupabaseToTastingNote } from '@/lib/data-transformers';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function FriendNotesPageContent() {
  const router = useRouter();
  const params = useParams();
  const friendId = params.friendId as string;
  
  const { data: friends = [] } = useFriends();
  const { data: notes = [], isLoading, error } = useFriendTastingNotes(friendId);
  
  // Get friend info
  const friend = friends.find(f => f.friend_id === friendId);
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">친구의 노트를 불러올 수 없습니다.</p>
          <button 
            onClick={() => router.push('/friends')}
            className="text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            친구 목록으로 돌아가기
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
              onClick={() => router.push('/friends')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              친구 목록
            </button>
            <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">
              {friend ? `@${friend.friend_profile.username}` : 'Friend Notes'}
            </h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingSpinner message="노트를 불러오는 중..." />
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">
              {friend ? `@${friend.friend_profile.username}님이` : '이 친구가'} 아직 노트를 작성하지 않았습니다.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const transformedNote = transformSupabaseToTastingNote(note);
              return (
                <div
                  key={note.id}
                  className="border-b border-gray-100 pb-4 hover:bg-gray-50 transition-colors cursor-pointer -mx-2 px-2 py-2 rounded"
                  onClick={() => router.push(`/friends/${friendId}/notes/${note.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm">
                        {transformedNote.title}
                      </h4>
                      <div className="text-xs text-gray-500 space-x-2">
                        <span>{formatDate(transformedNote.created_at)}</span>
                        {(transformedNote.country || transformedNote.region) && (
                          <span>•</span>
                        )}
                        {transformedNote.country && <span>{transformedNote.country}</span>}
                        {transformedNote.region && transformedNote.country && <span>,</span>}
                        {transformedNote.region && <span>{transformedNote.region}</span>}
                      </div>
                      {transformedNote.cup_notes && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {transformedNote.cup_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-light text-emerald-800">
                        {transformedNote.ratings.overall}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function FriendNotesPage() {
  return (
    <ProtectedRoute>
      <FriendNotesPageContent />
    </ProtectedRoute>
  );
}