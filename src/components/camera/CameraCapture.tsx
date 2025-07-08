'use client';

import { useRef, useState, useCallback } from 'react';
import { CameraProps } from '@/types';

export default function CameraCapture({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      // 먼저 getUserMedia 지원 여부 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('이 브라우저는 카메라를 지원하지 않습니다. HTTPS 연결이 필요할 수 있습니다.');
        return;
      }

      setDebugInfo('카메라 권한 요청 중...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      setDebugInfo('스트림 획득 완료');
      
      if (videoRef.current) {
        const video = videoRef.current;
        setDebugInfo('비디오 요소 확인됨');
        
        // 스트림 트랙 먼저 확인
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) {
          setDebugInfo(`비디오 트랙 ${tracks.length}개 발견`);
          console.log('Video tracks:', tracks);
        } else {
          setError('비디오 트랙을 찾을 수 없습니다');
          return;
        }
        
        try {
          video.srcObject = stream;
          setDebugInfo('비디오 요소에 스트림 연결');
          
          // 비디오 이벤트 리스너들
          video.onloadstart = () => setDebugInfo('비디오 로드 시작');
          video.onloadeddata = () => setDebugInfo('비디오 데이터 로드됨');
          video.oncanplay = () => setDebugInfo('비디오 재생 가능');
          video.onplaying = () => setDebugInfo('비디오 재생 중');
          
          video.onloadedmetadata = () => {
            setDebugInfo(`메타데이터 로드: ${video.videoWidth}x${video.videoHeight}`);
            
            // 비디오 재생 시도
            video.play().then(() => {
              setDebugInfo('비디오 재생 시작됨');
              setIsStreaming(true);
              setError(null);
            }).catch(err => {
              setError('비디오 재생 실패: ' + err.message);
              console.error('Play error:', err);
            });
          };
          
          video.onerror = (e) => {
            setError('비디오 오류: ' + e.toString());
            console.error('Video error:', e);
          };
          
        } catch (err) {
          setError('비디오 스트림 설정 실패: ' + (err as Error).message);
          console.error('Video stream error:', err);
        }
      } else {
        setError('비디오 요소를 찾을 수 없습니다');
      }
    } catch (err) {
      setError('카메라 접근 권한이 필요합니다: ' + (err as Error).message);
      console.error('Camera access error:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        onCapture(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [onCapture, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative w-full h-full">
        {/* 항상 비디오 요소를 렌더링 */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ 
            backgroundColor: '#000',
            maxWidth: '100%',
            maxHeight: '100%',
            display: isStreaming ? 'block' : 'none'
          }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!isStreaming && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="mb-4">카메라를 시작하려면 버튼을 클릭하세요</p>
              {debugInfo && <p className="mb-2 text-yellow-400">{debugInfo}</p>}
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                카메라 시작
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <p className="mb-4">{error}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        )}
        
        {isStreaming && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-8">
            <button
              onClick={handleClose}
              className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-700"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button
              onClick={capturePhoto}
              disabled={!isStreaming}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
            >
              <div className="w-14 h-14 bg-gray-300 rounded-full"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}