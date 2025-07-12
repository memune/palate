'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { CameraProps } from '@/types';
import { compressImage, validateImageSize } from '@/lib/image-utils';

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

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    try {
      setDebugInfo('사진 캡처 중...');
      
      // 최적 해상도로 캡처 (OCR을 위해 충분한 화질 유지)
      const captureWidth = Math.min(video.videoWidth, 1920);
      const captureHeight = Math.min(video.videoHeight, 1080);
      
      canvas.width = captureWidth;
      canvas.height = captureHeight;
      
      // 고화질 렌더링 설정
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // 비디오에서 최적화된 크기로 캡처
      context.drawImage(video, 0, 0, captureWidth, captureHeight);

      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setDebugInfo('이미지 최적화 중...');
            const originalFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            
            // 파일 크기 검증
            if (!validateImageSize(originalFile, 10)) {
              setError('파일 크기가 10MB를 초과합니다');
              return;
            }

            // 이미지 압축 및 최적화 (OCR을 위해 품질 유지)
            const optimizedFile = await compressImage(originalFile, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.9, // OCR을 위해 높은 품질 유지
              format: 'jpeg'
            });

            setDebugInfo('캡처 완료');
            onCapture(optimizedFile);
            stopCamera();
          } catch (error) {
            console.error('Image optimization error:', error);
            setError('이미지 최적화 중 오류가 발생했습니다');
          }
        }
      }, 'image/jpeg', 0.95); // 초기 캡처는 높은 품질로
    } catch (error) {
      console.error('Capture error:', error);
      setError('사진 캡처 중 오류가 발생했습니다');
    }
  }, [onCapture, stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  // 컴포넌트가 마운트되면 자동으로 카메라 시작
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="mb-4">카메라를 시작하는 중...</p>
              {debugInfo && <p className="mb-2 text-yellow-400">{debugInfo}</p>}
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