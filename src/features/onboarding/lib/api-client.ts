import { apiClient } from '@/lib/remote/api-client';
import type { SignupRequest, SignupResponse } from './dto';
import type { TermsResponse } from '@/features/terms/lib/dto';

/**
 * 회원가입 API
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const response = await apiClient.post('/api/onboarding/signup', {
    json: data,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '회원가입에 실패했습니다');
  }

  // respond 함수는 성공시 데이터를 바로 반환함
  const result = await response.json();
  return result;
};

/**
 * 최신 약관 조회 API
 */
export const fetchLatestTerms = async (): Promise<TermsResponse> => {
  try {
    const response = await apiClient.get('/api/terms/latest');

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || '약관 조회에 실패했습니다');
    }

    // respond 함수는 성공시 데이터를 바로 반환함
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('fetchLatestTerms error:', error);
    throw error;
  }
};