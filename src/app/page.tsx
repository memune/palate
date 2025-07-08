import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Palate</h1>
          <p className="text-gray-600">커피 테이스팅 노트 아카이브</p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/capture" 
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            📸 새 테이스팅 노트 촬영
          </Link>
          
          <Link 
            href="/notes" 
            className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            📝 저장된 노트 보기
          </Link>
        </div>
      </div>
    </main>
  );
}