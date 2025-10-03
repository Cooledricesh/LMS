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

  const result = await response.json();
  return result.data;
};

/**
 * 최신 약관 조회 API
 */
export const fetchLatestTerms = async (): Promise<TermsResponse> => {
  const response = await apiClient.get('/api/terms/latest');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '약관 조회에 실패했습니다');
  }

  const result = await response.json();
  return result.data;
};