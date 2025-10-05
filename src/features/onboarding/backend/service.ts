import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  CreateProfileRequestSchema,
  SignupResponseSchema,
  ProfileTableRowSchema,
  type CreateProfileRequest,
  type SignupResponse,
  type ProfileRow,
  type TermsAgreementRow,
} from '@/features/onboarding/backend/schema';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from '@/features/onboarding/backend/error';

const PROFILES_TABLE = 'profiles';
const TERMS_AGREEMENTS_TABLE = 'terms_agreements';
const CURRENT_TERMS_VERSION = '1.0.0';

// 프로필만 생성하는 함수 (Auth는 클라이언트에서 처리)
export const createUserProfile = async (
  client: SupabaseClient,
  data: CreateProfileRequest,
  ipAddress?: string,
  userAgent?: string
): Promise<HandlerResult<SignupResponse, OnboardingServiceError, unknown>> => {
  // 입력 데이터 검증
  const { userId, email, role, name, phoneNumber, termsAgreed } = data;

  // 약관 동의 확인
  if (!termsAgreed.service || !termsAgreed.privacy) {
    return failure(
      400,
      onboardingErrorCodes.termsNotAgreed,
      'You must agree to all required terms'
    );
  }

  try {
    // 1. 프로필 정보 저장
    const profileData = {
      id: userId, // 클라이언트에서 전달받은 Auth user ID
      role,
      name,
      phone_number: phoneNumber.replace(/-/g, ''), // 하이픈 제거
      terms_agreed_at: new Date().toISOString(),
    };

    const { data: profileRow, error: profileError } = await client
      .from(PROFILES_TABLE)
      .insert(profileData)
      .select()
      .single<ProfileRow>();

    if (profileError) {
      return failure(
        500,
        onboardingErrorCodes.profileCreationFailed,
        profileError.message || 'Failed to create user profile'
      );
    }

    const rowParse = ProfileTableRowSchema.safeParse(profileRow);
    if (!rowParse.success) {
      return failure(
        500,
        onboardingErrorCodes.validationError,
        'Profile data validation failed',
        rowParse.error.format()
      );
    }

    // 2. 약관 동의 이력 저장
    const termsAgreements = [
      {
        user_id: userId,
        terms_version: CURRENT_TERMS_VERSION,
        terms_type: 'service' as const,
        agreed_at: new Date().toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
      {
        user_id: userId,
        terms_version: CURRENT_TERMS_VERSION,
        terms_type: 'privacy' as const,
        agreed_at: new Date().toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
    ];

    const { error: termsError } = await client
      .from(TERMS_AGREEMENTS_TABLE)
      .insert(termsAgreements);

    if (termsError) {
      // 프로필 삭제 (롤백)
      await client.from(PROFILES_TABLE).delete().eq('id', userId);

      return failure(
        500,
        onboardingErrorCodes.termsAgreementFailed,
        termsError.message || 'Failed to save terms agreement'
      );
    }

    // 3. 응답 데이터 생성
    const response = {
      userId: rowParse.data.id,
      email,
      role: rowParse.data.role,
      name: rowParse.data.name,
      phoneNumber: rowParse.data.phone_number,
      createdAt: rowParse.data.created_at,
    } satisfies SignupResponse;

    const parsed = SignupResponseSchema.safeParse(response);
    if (!parsed.success) {
      return failure(
        500,
        onboardingErrorCodes.validationError,
        'Response validation failed',
        parsed.error.format()
      );
    }

    return success(parsed.data);
  } catch (error) {
    return failure(
      500,
      onboardingErrorCodes.profileCreationFailed,
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
  }
};