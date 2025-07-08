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
            ☕ Palate
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
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
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
            redirectTo={`${window.location.origin}/`}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '이미 계정이 있으신가요? 로그인',
                },
                sign_up: {
                  email_label: '이메일',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '가입 중...',
                  social_provider_text: '{{provider}}로 시작하기',
                  link_text: '계정이 없으신가요? 회원가입',
                },
                forgotten_password: {
                  email_label: '이메일',
                  button_label: '비밀번호 재설정 링크 보내기',
                  link_text: '비밀번호를 잊으셨나요?',
                },
              },
            }}
          />
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>가입하시면 개인의 테이스팅 노트를 안전하게 저장하고</p>
          <p>모든 기기에서 동기화하여 확인할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}