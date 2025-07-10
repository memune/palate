'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function HomePage() {
  const { user, signOut } = useAuth();
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecentNotes();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      console.log('프로필 정보 가져오는 중...', user?.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      console.log('프로필 조회 결과:', { data, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // profiles 테이블이 없는 경우 빈 프로필로 설정
        setUserProfile({ username: null });
      } else {
        setUserProfile(data || { username: null });
        // If user doesn't have a username, show setup modal
        if (!data || !data.username) {
          console.log('닉네임이 없어서 모달을 표시해야 함');
          setShowUsernameModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setUserProfile({ username: null });
    }
  };

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

  // 외부 클릭시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !showUsernameModal) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showUsernameModal]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {user && (
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-gray-900 tracking-wide">
                Palate
              </h1>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">마이페이지</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      {userProfile?.username ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">@{userProfile.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">로그인된 계정</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          <p className="text-xs text-amber-600 mt-1">닉네임을 설정해주세요</p>
                        </>
                      )}
                    </div>
                    {userProfile?.username ? (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowUsernameModal(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        닉네임 수정
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          console.log('닉네임 설정하기 버튼 클릭됨');
                          console.log('현재 userProfile:', userProfile);
                          console.log('현재 showUsernameModal:', showUsernameModal);
                          setShowUserMenu(false);
                          setShowUsernameModal(true);
                          console.log('showUsernameModal을 true로 설정함');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        닉네임 설정하기
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">

        {/* Main CTA */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              커피 노트 작성하기
            </h2>
            <p className="text-gray-600 mb-6">
              매장에서 받은 컵노트를 촬영하면 AI가 자동으로 분석해서 내용을 추출합니다
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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
            <h3 className="text-lg font-semibold text-gray-800">
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

      {/* Username Setup/Edit Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {userProfile?.username ? '닉네임 변경' : '닉네임 설정'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              다른 사용자들이 회원님을 찾을 수 있는 고유한 닉네임을 설정해주세요.
            </p>
            
            <UsernameForm 
              currentUsername={userProfile?.username || ''}
              onSuccess={(newUsername) => {
                setUserProfile({...userProfile, username: newUsername});
                setShowUsernameModal(false);
              }}
              onCancel={() => setShowUsernameModal(false)}
              isFirstTime={!userProfile?.username}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Username Form Component
function UsernameForm({ currentUsername, onSuccess, onCancel, isFirstTime }: {
  currentUsername: string;
  onSuccess: (username: string) => void;
  onCancel: () => void;
  isFirstTime: boolean;
}) {
  const { user } = useAuth();
  const [username, setUsername] = useState(currentUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateUsername = (value: string) => {
    if (value.length < 3) return '닉네임은 3자 이상이어야 합니다.';
    if (value.length > 30) return '닉네임은 30자 이하여야 합니다.';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return '영문, 숫자, 언더바(_)만 사용 가능합니다.';
    if (value.startsWith('_') || value.endsWith('_')) return '닉네임은 언더바로 시작하거나 끝날 수 없습니다.';
    return '';
  };

  const checkUsernameAvailability = async (value: string) => {
    if (value === currentUsername) return true;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', value)
      .single();

    return error?.code === 'PGRST116'; // No rows returned means available
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const isAvailable = await checkUsernameAvailability(username);
    if (!isAvailable) {
      setError('이미 사용 중인 닉네임입니다.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          username: username,
          display_name: user?.email,
        });

      if (error) {
        console.error('Error updating username:', error);
        setError('닉네임 설정 중 오류가 발생했습니다.');
      } else {
        onSuccess(username);
      }
    } catch (error) {
      console.error('Error updating username:', error);
      setError('닉네임 설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="coffee_lover"
            maxLength={30}
            required
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          영문, 숫자, 언더바(_)만 사용 가능 (3-30자)
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="flex-1 bg-emerald-800 text-white py-2 px-4 rounded-lg hover:bg-emerald-900 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? '저장 중...' : (isFirstTime ? '설정하기' : '변경하기')}
        </button>
        {!isFirstTime && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}