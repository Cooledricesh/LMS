/**
 * 서버 validation 에러 타입
 */
export interface ValidationError {
  code: string;
  message: string;
  details?: ZodFormattedError;
}

/**
 * Zod 에러 포맷 타입
 */
export interface ZodFormattedError {
  _errors: string[];
  [key: string]: string[] | ZodFormattedError | undefined;
}

/**
 * API 에러 응답 타입
 */
export interface ApiErrorResponse {
  error: ValidationError;
}

/**
 * 커스텀 Validation 에러 클래스
 */
export class ValidationException extends Error {
  public readonly details?: ZodFormattedError;
  public readonly code: string;

  constructor(message: string, code: string, details?: ZodFormattedError) {
    super(message);
    this.name = 'ValidationException';
    this.code = code;
    this.details = details;
  }
}

/**
 * Zod 에러를 필드별 에러 메시지로 변환
 */
export function parseZodFormattedError(
  zodError?: ZodFormattedError | any
): Record<string, string> {
  if (!zodError) return {};

  const errors: Record<string, string> = {};

  // 재귀적으로 에러 메시지 추출
  const extractErrors = (obj: any, prefix = ''): void => {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      if (key === '_errors') continue;

      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        // 직접적인 에러 메시지 배열
        if (value.length > 0 && typeof value[0] === 'string') {
          errors[fieldPath] = value[0];
        }
      } else if (value && typeof value === 'object') {
        // 중첩된 객체
        if ('_errors' in value && Array.isArray(value._errors) && value._errors.length > 0) {
          errors[fieldPath] = value._errors[0];
        } else {
          extractErrors(value, fieldPath);
        }
      }
    }
  };

  extractErrors(zodError);

  // 특별한 필드명 매핑
  const fieldMappings: Record<string, string> = {
    'termsAgreed': 'terms',
    'termsAgreed.service': 'terms',
    'termsAgreed.privacy': 'terms',
  };

  const mappedErrors: Record<string, string> = {};
  for (const [key, message] of Object.entries(errors)) {
    const mappedKey = fieldMappings[key] || key;
    mappedErrors[mappedKey] = message;
  }

  return mappedErrors;
}