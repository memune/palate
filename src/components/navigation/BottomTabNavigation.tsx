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
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      )
    },
    {
      id: 'feed',
      name: '피드',
      href: '/feed',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    },
    {
      id: 'friends',
      name: '친구',
      href: '/friends',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'notes',
      name: '노트',
      href: '/notes',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-800' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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