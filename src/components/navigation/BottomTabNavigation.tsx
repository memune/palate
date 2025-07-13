'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomTabNavigation() {
  const pathname = usePathname();

  const tabs = [
    {
      id: 'home',
      name: '홈',
      href: '/',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10M9 21h6" />
        </svg>
      )
    },
    {
      id: 'feed',
      name: '피드',
      href: '/feed',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'friends',
      name: '친구',
      href: '/friends',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    {
      id: 'notes',
      name: '노트',
      href: '/notes',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  // 특정 페이지에서는 하단 탭을 숨김
  const hideOnPages = ['/capture', '/edit-note'];
  const shouldHide = hideOnPages.some(page => pathname.startsWith(page));

  if (shouldHide) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          
          return (
            <Link 
              key={tab.id} 
              href={tab.href}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-emerald-50' : ''
              }`}
            >
              {tab.icon(isActive)}
              <span className={`text-xs mt-1 font-medium ${
                isActive ? 'text-emerald-800' : 'text-gray-500'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}