'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';

function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        {/* User Header */}
        {user && (
          <div className="flex justify-between items-center mb-8">
            <div className="text-gray-700">
              <span className="text-sm">환영합니다, </span>
              <span className="font-medium">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              로그아웃
            </button>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            ☕ Palate
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI 기반 OCR로 커피 테이스팅 노트를 쉽게 기록하세요
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📷</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                사진으로 기록
              </h2>
              <p className="text-gray-600">
                커피 포장지나 메뉴를 촬영하면 AI가 자동으로 정보를 추출합니다
              </p>
            </div>
            <Link 
              href="/capture"
              className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              촬영하기
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                노트 관리
              </h2>
              <p className="text-gray-600">
                저장된 테이스팅 노트를 확인하고 관리하세요
              </p>
            </div>
            <Link 
              href="/notes"
              className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              노트 보기
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8">
            ✨ 주요 기능
          </h3>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">🤖</div>
              <h4 className="font-semibold mb-2">AI OCR</h4>
              <p className="text-sm text-gray-600">
                Gemini Flash를 활용한 정확한 텍스트 인식
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">📊</div>
              <h4 className="font-semibold mb-2">전문 평가</h4>
              <p className="text-sm text-gray-600">
                8단계 전문 커피 테이스팅 평가 시스템
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">☁️</div>
              <h4 className="font-semibold mb-2">클라우드 동기화</h4>
              <p className="text-sm text-gray-600">
                모든 기기에서 안전하게 동기화
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-3xl mb-3">📱</div>
              <h4 className="font-semibold mb-2">모바일 최적화</h4>
              <p className="text-sm text-gray-600">
                언제 어디서나 쉽게 기록하고 관리
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  );
}