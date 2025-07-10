'use client';

import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';

function HomePage() {
  const { user, signOut } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-6 py-12">
        {/* User Header */}
        {user && (
          <div className="flex justify-between items-center mb-16">
            <div className="text-gray-600">
              <span className="text-sm font-light">{user.email}</span>
            </div>
            <button
              onClick={signOut}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-light"
            >
              로그아웃
            </button>
          </div>
        )}

        <div className="text-center mb-20">
          <h1 className="text-6xl font-thin text-gray-800 mb-6 tracking-wide">
            Palate
          </h1>
          <p className="text-lg text-gray-500 font-light max-w-md mx-auto leading-relaxed">
            Professional coffee tasting notes
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid gap-6">
            <Link href="/capture" className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-light text-gray-800 mb-2">
                      Capture
                    </h2>
                    <p className="text-gray-500 font-light text-sm">
                      AI-powered extraction from photos
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/notes" className="group">
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-light text-gray-800 mb-2">
                      Notes
                    </h2>
                    <p className="text-gray-500 font-light text-sm">
                      Curated tasting records
                    </p>
                  </div>
                  <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
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