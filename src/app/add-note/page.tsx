'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Toast from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';

// Make this page dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

function AddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // 폼 상태
  const [formData, setFormData] = useState({
    title: '',
    country: '',
    region: '',
    farm: '',
    variety: '',
    process: '',
    altitude: '',
    cup_notes: '',
    notes: ''
  });
  
  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || isSubmitting) return;

    if (!formData.title.trim()) {
      setErrorMessage('제목을 입력해주세요.');
      setShowErrorToast(true);
      return;
    }

    setIsSubmitting(true);
    setShowErrorToast(false);

    try {
      // 직접 Supabase에 저장
      const { data, error } = await supabase
        .from('tasting_notes')
        .insert([{
          user_id: user.id,
          title: formData.title.trim(),
          date: new Date().toISOString(),
          country: formData.country.trim() || null,
          farm: formData.farm.trim() || null,
          region: formData.region.trim() || null,
          variety: formData.variety.trim() || null,
          altitude: formData.altitude.trim() || null,
          process: formData.process.trim() || null,
          cup_notes: formData.cup_notes.trim() || null,
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
          notes: formData.notes.trim() || null,
          image_url: null,
          extracted_text: null
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // 성공 토스트 표시
      setShowSuccessToast(true);
      
      // 1초 후 리다이렉트
      setTimeout(() => {
        router.push(`/note/${data.id}`);
      }, 1000);
      
    } catch (error: any) {
      setIsSubmitting(false);
      setErrorMessage(error?.message || '노트 저장에 실패했습니다. 다시 시도해주세요.');
      setShowErrorToast(true);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-stone-600 hover:text-stone-900 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로
            </button>
            <h1 className="text-lg font-light text-gray-700 tracking-tight">테이스팅 노트 추가</h1>
            <div className="w-16" />
          </div>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 에티오피아 예가체프 G1"
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    원산지
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 에티오피아"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    지역
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 예가체프"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    농장
                  </label>
                  <input
                    type="text"
                    name="farm"
                    value={formData.farm}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 워카 농장"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    품종
                  </label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 헤이룸"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    가공 방법
                  </label>
                  <input
                    type="text"
                    name="process"
                    value={formData.process}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 워시드"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고도
                  </label>
                  <input
                    type="text"
                    name="altitude"
                    value={formData.altitude}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="예: 1800-2000m"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  컵 노트
                </label>
                <input
                  type="text"
                  name="cup_notes"
                  value={formData.cup_notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 블루베리, 초콜릿, 시트러스"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="개인적인 기록이나 느낀 점을 자유롭게 작성해주세요..."
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '테이스팅 노트 저장'}
            </button>
          </div>
        </form>
      </main>

      {/* 토스트 메시지들 */}
      <Toast
        message="노트가 성공적으로 저장되었습니다!"
        type="success"
        show={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        duration={2000}
      />
      
      <Toast
        message={errorMessage}
        type="error"
        show={showErrorToast}
        onClose={() => setShowErrorToast(false)}
        duration={4000}
      />
    </div>
  );
}

export default function AddNote() {
  return (
    <ProtectedRoute>
      <AddNotePage />
    </ProtectedRoute>
  );
}