'use client';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase';

export default function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ☕ <span className="brand-font">Palate</span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            커피 테이스팅 노트를 기록하고 관리하세요
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#059669',
                    brandAccent: '#047857',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            providers={['google']}
            onlyThirdPartyProviders={true}
            redirectTo={`${window.location.origin}/`}
            localization={{
              variables: {
                sign_in: {
                  social_provider_text: '{{provider}}로 로그인',
                },
                sign_up: {
                  social_provider_text: '{{provider}}로 시작하기',
                },
              },
            }}
          />
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>Google 계정으로 간편하게 시작하세요.</p>
          <p>개인의 테이스팅 노트를 안전하게 저장하고 모든 기기에서 동기화할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}