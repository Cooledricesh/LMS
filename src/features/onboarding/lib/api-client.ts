import { apiClient } from '@/lib/remote/api-client';
import { createClient } from '@/lib/supabase/client';
import type { CreateProfileRequest, SignupRequest, SignupResponse } from './dto';
import type { TermsResponse } from '@/features/terms/lib/dto';
import { ValidationException, type ApiErrorResponse } from './error';

/**
 * 회원가입 API - Supabase Auth 사용 후 프로필 생성
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
  const supabase = createClient();

  // 1단계: Supabase Auth로 사용자 생성
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (authError) {
    // 이미 등록된 이메일 에러
    if (authError.message?.includes('already registered')) {
      throw new Error('이미 등록된 이메일입니다');
    }
    throw new Error(authError.message || '회원가입에 실패했습니다');
  }

  if (!authData.user) {
    throw new Error('사용자 생성에 실패했습니다');
  }

  // 2단계: 프로필 생성
  try {
    const profileData: CreateProfileRequest = {
      userId: authData.user.id,
      email: data.email,
      role: data.role,
      name: data.name,
      phoneNumber: data.phoneNumber,
      termsAgreed: data.termsAgreed,
    };

    const profileResponse = await createProfile(profileData);
    return profileResponse;
  } catch (error) {
    // 프로필 생성 실패 시 Auth 사용자 삭제 시도
    // (Note: Supabase는 일반적으로 사용자 삭제를 허용하지 않으므로 이는 보통 실패함)
    console.error('프로필 생성 실패:', error);

    // 원본 에러를 그대로 throw
    throw error;
  }
};

/**
 * 프로필 생성 API (Auth는 클라이언트에서 처리)
 */
export const createProfile = async (data: CreateProfileRequest): Promise<SignupResponse> => {
  const response = await apiClient.post('/api/onboarding/create-profile', {
    json: data,
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    const error = errorData.error;

    // Validation 에러인 경우 상세 정보 포함
    if (error?.code === 'INVALID_INPUT') {
      throw new ValidationException(
        error.message || '입력 정보가 올바르지 않습니다',
        error.code,
        error.details
      );
    }

    // 일반 에러
    throw new Error(error?.message || '프로필 생성에 실패했습니다');
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