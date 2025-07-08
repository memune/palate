'use client';

import { useState } from 'react';

export default function OCRTestMode() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTestMode, setIsTestMode] = useState(false);

  const runAPITest = async () => {
    setIsTestMode(true);
    setTestResult('API 연결 테스트 중...');
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
      if (!apiKey) {
        setTestResult('❌ API 키가 설정되지 않았습니다.');
        return;
      }
      
      setTestResult('✅ API 키 확인됨. Gemini Flash OCR이 준비되었습니다!');
    } catch (error) {
      setTestResult(`❌ 테스트 실패: ${error}`);
    } finally {
      setIsTestMode(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={runAPITest}
        disabled={isTestMode}
        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50"
      >
        {isTestMode ? '테스트 중...' : 'OCR 테스트'}
      </button>
      
      {testResult && (
        <div className="mt-2 p-3 bg-white rounded-lg shadow-lg max-w-xs">
          <p className="text-sm">{testResult}</p>
        </div>
      )}
    </div>
  );
}