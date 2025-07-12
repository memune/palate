'use client';

import { useState, useCallback } from 'react';
import { compressImage, validateImageSize, isSupportedImageFormat, extractImageMetadata } from '@/lib/image-utils';

interface ImageOptimizationState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
}

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
  maxSizeMB?: number;
}

export function useImageOptimization() {
  const [state, setState] = useState<ImageOptimizationState>({
    isProcessing: false,
    progress: 0,
    error: null,
  });

  const optimizeImage = useCallback(async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<File | null> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg',
      maxSizeMB = 10
    } = options;

    setState({ isProcessing: true, progress: 0, error: null });

    try {
      // 1. 파일 형식 검증
      setState(prev => ({ ...prev, progress: 10 }));
      if (!isSupportedImageFormat(file)) {
        throw new Error('지원되지 않는 이미지 형식입니다');
      }

      // 2. 파일 크기 검증
      setState(prev => ({ ...prev, progress: 20 }));
      if (!validateImageSize(file, maxSizeMB)) {
        throw new Error(`파일 크기가 ${maxSizeMB}MB를 초과합니다`);
      }

      // 3. 메타데이터 추출
      setState(prev => ({ ...prev, progress: 30 }));
      const metadata = await extractImageMetadata(file);
      console.log('Image metadata:', metadata);

      // 4. 이미지 압축
      setState(prev => ({ ...prev, progress: 50 }));
      const optimizedFile = await compressImage(file, {
        maxWidth,
        maxHeight,
        quality,
        format,
      });

      setState(prev => ({ ...prev, progress: 100 }));
      
      const compressionRatio = ((file.size - optimizedFile.size) / file.size * 100).toFixed(1);
      console.log(`Image compression completed: ${compressionRatio}% reduction`);
      
      setState({ isProcessing: false, progress: 100, error: null });
      return optimizedFile;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '이미지 최적화 중 오류가 발생했습니다';
      setState({ isProcessing: false, progress: 0, error: errorMessage });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ isProcessing: false, progress: 0, error: null });
  }, []);

  return {
    ...state,
    optimizeImage,
    reset,
  };
}