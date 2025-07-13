'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TastingNote } from '@/types';
import { transformSupabaseToTastingNote } from '@/lib/data-transformers';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function HomePage() {
  const { user, signOut } = useAuth();
  const [recentNotes, setRecentNotes] = useState<TastingNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecentNotes();
      fetchUserProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const transformedNotes = (data || []).map(transformSupabaseToTastingNote);
        setRecentNotes(transformedNotes);
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
      const target = event.target as Element;
      if (showUserMenu && !showUsernameModal && !target.closest('.user-menu-container')) {
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
        <nav className="bg-gray-50 border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-light text-gray-900 tracking-tight brand-font">
                Palate
              </h1>
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors px-4 py-3 rounded-xl hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm font-medium">My</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 z-50 user-menu-dropdown backdrop-blur-sm">
                    <div className="px-6 py-4 border-b border-gray-100">
                      {userProfile?.username ? (
                        <>
                          <p className="text-base font-medium text-gray-900">@{userProfile.username}</p>
                          <p className="text-sm text-gray-500 truncate mt-1">{user.email}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-500">로그인된 계정</p>
                          <p className="text-base font-medium text-gray-900 truncate">{user.email}</p>
                          <p className="text-sm text-emerald-700 mt-2 font-medium">닉네임을 설정해주세요</p>
                        </>
                      )}
                    </div>
                    {userProfile?.username ? (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('닉네임 수정 버튼 클릭됨');
                          console.log('현재 userProfile:', userProfile);
                          console.log('현재 showUsernameModal:', showUsernameModal);
                          setShowUserMenu(false);
                          setTimeout(() => {
                            setShowUsernameModal(true);
                            console.log('showUsernameModal을 true로 설정함');
                          }, 100);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer font-medium"
                        type="button"
                      >
                        닉네임 수정
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('닉네임 설정하기 버튼 클릭됨');
                          console.log('현재 userProfile:', userProfile);
                          console.log('현재 showUsernameModal:', showUsernameModal);
                          setShowUserMenu(false);
                          setTimeout(() => {
                            setShowUsernameModal(true);
                            console.log('showUsernameModal을 true로 설정함');
                          }, 100);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer font-medium"
                        type="button"
                      >
                        닉네임 설정하기
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
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
        <div className="mb-12 relative">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/30 via-gray-50/20 to-amber-50/30 rounded-3xl -mx-8 -my-6"></div>
          
          <div className="relative text-center mb-8 py-6">
            <h2 className="text-2xl font-light text-gray-900 mb-6 brand-font tracking-tight italic">
              Brewed Moments, Captured
            </h2>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Link 
              href="/capture"
              className="flex items-center justify-center bg-emerald-800 text-white px-6 py-3 rounded-xl hover:bg-emerald-900 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              사진으로 기록하기
            </Link>
            <Link 
              href="/add-note"
              className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              직접 입력하기
            </Link>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-light text-gray-700 brand-font">
              Recent
            </h3>
            <Link 
              href="/notes"
              className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium"
            >
              전체 보기
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">로딩 중...</div>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4 text-sm">
                아직 기록된 노트가 없습니다
              </div>
              <Link 
                href="/capture"
                className="text-emerald-800 hover:text-emerald-900 transition-colors text-sm font-medium"
              >
                첫 번째 커피를 기록해보세요
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <Link 
                  key={note.id} 
                  href={`/note/${note.id}`}
                  className="block border-b border-gray-100 pb-3 hover:bg-gray-50 transition-colors cursor-pointer -mx-2 px-2 py-2 rounded"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm">
                        {note.title}
                      </h4>
                      <div className="text-xs text-gray-500 space-x-2">
                        <span>{new Date(note.created_at).toLocaleDateString('ko-KR')}</span>
                        {(note.country || note.region) && (
                          <span>•</span>
                        )}
                        {note.country && <span>{note.country}</span>}
                        {note.region && note.country && <span>,</span>}
                        {note.region && <span>{note.region}</span>}
                      </div>
                      {note.cup_notes && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {note.cup_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Username Setup/Edit Modal */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {userProfile?.username ? '닉네임 변경' : '닉네임 설정'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              다른 사용자들이 회원님을 찾을 수 있는 고유한 닉네임을 설정해주세요.
            </p>
            
            <UsernameForm 
              currentUsername={userProfile?.username || ''}
              onSuccess={(newUsername) => {
                console.log('닉네임 수정 완료:', newUsername);
                setUserProfile({...userProfile, username: newUsername});
                setShowUsernameModal(false);
                // 프로필 정보 다시 불러오기
                fetchUserProfile();
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