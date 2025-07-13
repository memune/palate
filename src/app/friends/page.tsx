'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  useFriends, 
  useReceivedFriendRequests, 
  useSentFriendRequests,
  useSearchUsers,
  useSendFriendRequest,
  useRespondToFriendRequest,
  useCancelFriendRequest,
  useRemoveFriend,
  UserProfile
} from '@/hooks/useFriendsQuery';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function FriendsPageContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  // Query hooks
  const { data: friends = [], isLoading: friendsLoading } = useFriends();
  const { data: receivedRequests = [], isLoading: receivedLoading } = useReceivedFriendRequests();
  const { data: sentRequests = [], isLoading: sentLoading } = useSentFriendRequests();
  const { data: searchUsersData = [] } = useSearchUsers(searchTerm);

  // Mutation hooks
  const sendRequestMutation = useSendFriendRequest();
  const respondToRequestMutation = useRespondToFriendRequest();
  const cancelRequestMutation = useCancelFriendRequest();
  const removeFriendMutation = useRemoveFriend();

  const handleSearch = () => {
    setSearchResults(searchUsersData);
  };

  const handleSendRequest = async (receiverId: string) => {
    try {
      await sendRequestMutation.mutateAsync({ receiverId });
      // Remove from search results after sending request
      setSearchResults(prev => prev.filter(user => user.id !== receiverId));
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await respondToRequestMutation.mutateAsync({ requestId, status: 'accepted' });
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await respondToRequestMutation.mutateAsync({ requestId, status: 'rejected' });
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequestMutation.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (confirm('정말로 이 친구를 삭제하시겠습니까?')) {
      try {
        await removeFriendMutation.mutateAsync(friendId);
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }
  };

  // Check if user already has pending request or is already friend
  const getRequestStatus = (userId: string) => {
    const sentRequest = sentRequests.find(req => req.receiver_id === userId);
    const isFriend = friends.some(friend => friend.friend_id === userId);
    
    if (isFriend) return 'friend';
    if (sentRequest) return 'pending';
    return 'none';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              홈
            </button>
            <h1 className="text-lg font-light text-gray-700 tracking-tight brand-font">Friends</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'friends'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            친구 ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'requests'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            요청 ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'add'
                ? 'border-emerald-800 text-emerald-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            친구 추가
          </button>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div>
            {friendsLoading ? (
              <LoadingSpinner message="친구 목록을 불러오는 중..." />
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">아직 친구가 없습니다</p>
                <button
                  onClick={() => setActiveTab('add')}
                  className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
                >
                  첫 번째 친구를 추가해보세요
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-800 font-medium text-sm">
                          {friend.friend_profile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">@{friend.friend_profile.username}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(friend.created_at).toLocaleDateString('ko-KR')}부터 친구
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/friends/${friend.friend_id}/notes`)}
                        className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
                      >
                        노트 보기
                      </button>
                      <button
                        onClick={() => handleRemoveFriend(friend.friend_id)}
                        className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                        disabled={removeFriendMutation.isPending}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">받은 요청</h3>
              {receivedLoading ? (
                <LoadingSpinner message="요청을 불러오는 중..." />
              ) : receivedRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">받은 친구 요청이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-800 font-medium text-sm">
                            {request.sender_profile?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">@{request.sender_profile?.username}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-emerald-800 text-white px-3 py-1 rounded-lg hover:bg-emerald-900 transition-colors text-sm"
                          disabled={respondToRequestMutation.isPending}
                        >
                          수락
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="bg-gray-200 text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                          disabled={respondToRequestMutation.isPending}
                        >
                          거절
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">보낸 요청</h3>
              {sentLoading ? (
                <LoadingSpinner message="요청을 불러오는 중..." />
              ) : sentRequests.filter(req => req.status === 'pending').length === 0 ? (
                <p className="text-gray-500 text-sm">보낸 친구 요청이 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {sentRequests.filter(req => req.status === 'pending').map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">
                            {request.receiver_profile?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">@{request.receiver_profile?.username}</p>
                          <p className="text-xs text-gray-500">요청 대기 중</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-red-600 hover:text-red-700 transition-colors text-sm font-medium"
                        disabled={cancelRequestMutation.isPending}
                      >
                        취소
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Friends */}
        {activeTab === 'add' && (
          <div>
            <div className="mb-6">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="닉네임으로 검색..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-emerald-800 text-white px-6 py-3 rounded-xl hover:bg-emerald-900 transition-colors text-sm font-medium"
                >
                  검색
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                {searchResults.map((user) => {
                  const status = getRequestStatus(user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <span className="text-emerald-800 font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">@{user.username}</p>
                          {user.display_name && (
                            <p className="text-xs text-gray-500">{user.display_name}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {status === 'friend' && (
                          <span className="text-emerald-800 text-sm font-medium">이미 친구</span>
                        )}
                        {status === 'pending' && (
                          <span className="text-gray-500 text-sm">요청 보냄</span>
                        )}
                        {status === 'none' && (
                          <button
                            onClick={() => handleSendRequest(user.id)}
                            className="bg-emerald-800 text-white px-4 py-2 rounded-lg hover:bg-emerald-900 transition-colors text-sm font-medium"
                            disabled={sendRequestMutation.isPending}
                          >
                            친구 요청
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {searchTerm && searchResults.length === 0 && searchUsersData.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">"{searchTerm}"에 해당하는 사용자를 찾을 수 없습니다</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <ProtectedRoute>
      <FriendsPageContent />
    </ProtectedRoute>
  );
}