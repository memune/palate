/**
 * 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 에러 타입 정의
 */
export type ErrorType = 
  | 'NETWORK_ERROR'
  | 'AUTH_ERROR' 
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * 통일된 에러 처리 함수
 */
export function handleError(error: unknown, context: string): AppError {
  console.error(`Error in ${context}:`, error);

  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Supabase 에러 처리
    if ('code' in error) {
      const supabaseError = error as any;
      switch (supabaseError.code) {
        case 'PGRST116':
          return new AppError('요청한 데이터를 찾을 수 없습니다.', 'NOT_FOUND', 404);
        case '42501':
          return new AppError('접근 권한이 없습니다.', 'AUTH_ERROR', 403);
        default:
          return new AppError(
            supabaseError.message || '서버 오류가 발생했습니다.',
            'SERVER_ERROR',
            500
          );
      }
    }

    return new AppError(error.message, 'UNKNOWN_ERROR');
  }

  return new AppError('알 수 없는 오류가 발생했습니다.', 'UNKNOWN_ERROR');
}

/**
 * 사용자 친화적인 에러 메시지 반환
 */
export function getUserFriendlyErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'NOT_FOUND':
      return '요청한 정보를 찾을 수 없습니다.';
    case 'AUTH_ERROR':
      return '로그인이 필요하거나 권한이 없습니다.';
    case 'VALIDATION_ERROR':
      return '입력된 정보를 확인해주세요.';
    case 'NETWORK_ERROR':
      return '네트워크 연결을 확인해주세요.';
    case 'SERVER_ERROR':
      return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    default:
      return error.message || '예상치 못한 오류가 발생했습니다.';
  }
}

/**
 * 에러 알림 표시 (현재는 alert, 나중에 toast로 대체 가능)
 */
export function showError(error: unknown, context: string = 'Unknown') {
  const appError = handleError(error, context);
  const message = getUserFriendlyErrorMessage(appError);
  alert(message);
}

/**
 * 성공 메시지 표시
 */
export function showSuccess(message: string) {
  // 현재는 간단히 console.log, 나중에 toast로 대체 가능
  console.log('Success:', message);
}