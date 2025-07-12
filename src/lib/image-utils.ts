/**
 * 이미지 최적화 유틸리티
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * 이미지를 압축하고 최적화합니다
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas context를 생성할 수 없습니다'));
      return;
    }

    img.onload = () => {
      try {
        // 비율을 유지하면서 최대 크기에 맞게 리사이징
        const { width, height } = calculateOptimalSize(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        canvas.width = width;
        canvas.height = height;

        // 이미지 품질 개선을 위한 설정
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('이미지 압축에 실패했습니다'));
              return;
            }

            // File 객체로 변환
            const compressedFile = new File(
              [blob],
              `compressed_${file.name}`,
              {
                type: `image/${format}`,
                lastModified: Date.now(),
              }
            );

            resolve(compressedFile);
          },
          `image/${format}`,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('이미지 로드에 실패했습니다'));
    };

    // 파일을 데이터 URL로 변환하여 이미지 객체에 설정
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 최적 크기 계산 (비율 유지)
 */
function calculateOptimalSize(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  // 최대 폭 초과 시 조정
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  // 최대 높이 초과 시 조정
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * 이미지 파일 크기 검증
 */
export function validateImageSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * 지원되는 이미지 포맷인지 확인
 */
export function isSupportedImageFormat(file: File): boolean {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];
  return supportedTypes.includes(file.type);
}

/**
 * 이미지 메타데이터 추출
 */
export function extractImageMetadata(file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
      });
    };

    img.onerror = () => {
      reject(new Error('이미지 메타데이터 추출에 실패했습니다'));
    };

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => {
      reject(new Error('파일 읽기에 실패했습니다'));
    };
    reader.readAsDataURL(file);
  });
}