import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import BottomTabNavigation from '@/components/navigation/BottomTabNavigation';

// Make this layout dynamic to avoid SSR issues
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Palate - Coffee Tasting Notes',
  description: 'Archive your coffee tasting notes with OCR technology',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#374151',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
      </head>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <BottomTabNavigation />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}