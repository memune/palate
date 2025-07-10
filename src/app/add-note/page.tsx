'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AddNotePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    country: '',
    farm: '',
    region: '',
    variety: '',
    altitude: '',
    process: '',
    cup_notes: '',
    store_info: '',
    ratings: {
      aroma: 5,
      flavor: 5,
      acidity: 5,
      sweetness: 5,
      body: 5,
      aftertaste: 5,
      balance: 5,
      overall: 5,
    },
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (category: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [category]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasting_notes')
        .insert({
          user_id: user.id,
          title: formData.title,
          date: formData.date,
          country: formData.country || null,
          farm: formData.farm || null,
          region: formData.region || null,
          variety: formData.variety || null,
          altitude: formData.altitude || null,
          process: formData.process || null,
          cup_notes: formData.cup_notes || null,
          store_info: formData.store_info || null,
          ratings: formData.ratings,
          notes: formData.notes || null,
        });

      if (error) {
        console.error('Error saving note:', error);
        alert('노트 저장 중 오류가 발생했습니다.');
      } else {
        router.push('/notes');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('노트 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const ratingCategories = [
    { key: 'aroma', label: '향 (Aroma)' },
    { key: 'flavor', label: '맛 (Flavor)' },
    { key: 'acidity', label: '산미 (Acidity)' },
    { key: 'sweetness', label: '단맛 (Sweetness)' },
    { key: 'body', label: '바디 (Body)' },
    { key: 'aftertaste', label: '후미 (Aftertaste)' },
    { key: 'balance', label: '균형 (Balance)' },
    { key: 'overall', label: '전체 (Overall)' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            직접 입력하기
          </h1>
          <p className="text-gray-600 mt-2">
            커피 테이스팅 노트를 직접 입력해보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 콜롬비아 우일라 더치 워시드"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  날짜
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Coffee Information */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">커피 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  국가
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 콜롬비아"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  농장
                </label>
                <input
                  type="text"
                  name="farm"
                  value={formData.farm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 라 에스페란자 농장"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 우일라"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 카투라"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 1,500m"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  가공 방법
                </label>
                <input
                  type="text"
                  name="process"
                  value={formData.process}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="예: 더치 워시드"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                컵노트 (테이스팅 노트)
              </label>
              <input
                type="text"
                name="cup_notes"
                value={formData.cup_notes}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="예: 초콜릿, 견과류, 오렌지 산미"
              />
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                매장 정보
              </label>
              <input
                type="text"
                name="store_info"
                value={formData.store_info}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="예: 블루보틀 강남점"
              />
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">평가</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ratingCategories.map((category) => (
                <div key={category.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {category.label}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.ratings[category.key as keyof typeof formData.ratings]}
                      onChange={(e) => handleRatingChange(category.key, parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-lg font-semibold text-emerald-800 min-w-[3rem] text-center">
                      {formData.ratings[category.key as keyof typeof formData.ratings]}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">추가 노트</h2>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="개인적인 감상이나 추가 메모를 입력하세요..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-800 text-white px-12 py-3 rounded-lg hover:bg-emerald-900 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? '저장 중...' : '테이스팅 노트 저장'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function AddNote() {
  return (
    <ProtectedRoute>
      <AddNotePage />
    </ProtectedRoute>
  );
}