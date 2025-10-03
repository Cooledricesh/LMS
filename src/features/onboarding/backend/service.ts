import type { SupabaseClient } from '@supabase/supabase-js';
import {
  failure,
  success,
  type HandlerResult,
} from '@/backend/http/response';
import {
  SignupRequestSchema,
  SignupResponseSchema,
  ProfileTableRowSchema,
  type SignupRequest,
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

export const createUserProfile = async (
  client: SupabaseClient,
  data: SignupRequest,
  ipAddress?: string,
  userAgent?: string
): Promise<HandlerResult<SignupResponse, OnboardingServiceError, unknown>> => {
  // 입력 데이터 검증
  const parsedData = SignupRequestSchema.safeParse(data);
  if (!parsedData.success) {
    return failure(
      400,
      onboardingErrorCodes.invalidInput,
      'Invalid input data',
      parsedData.error.format()
    );
  }

  const { email, password, role, name, phoneNumber, termsAgreed } = parsedData.data;

  // 약관 동의 확인
  if (!termsAgreed.service || !termsAgreed.privacy) {
    return failure(
      400,
      onboardingErrorCodes.termsNotAgreed,
      'You must agree to all required terms'
    );
  }

  try {
    // 1. Supabase Auth로 계정 생성
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
        }
      }
    });

    if (authError) {
      // 이메일 중복 체크
      if (authError.message?.toLowerCase().includes('already registered')) {
        return failure(
          409,
          onboardingErrorCodes.emailAlreadyExists,
          'This email is already registered'
        );
      }
      return failure(
        500,
        onboardingErrorCodes.authSignupFailed,
        authError.message || 'Failed to create auth account'
      );
    }

    if (!authData.user) {
      return failure(
        500,
        onboardingErrorCodes.authSignupFailed,
        'Failed to create user account'
      );
    }

    // 2. 프로필 정보 저장
    const profileData = {
      id: authData.user.id,
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
      // Auth 계정 삭제 (롤백)
      await client.auth.admin.deleteUser(authData.user.id);

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

    // 3. 약관 동의 이력 저장
    const termsAgreements = [
      {
        user_id: authData.user.id,
        terms_version: CURRENT_TERMS_VERSION,
        terms_type: 'service' as const,
        agreed_at: new Date().toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
      {
        user_id: authData.user.id,
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
      // 프로필과 Auth 계정 삭제 (롤백)
      await client.from(PROFILES_TABLE).delete().eq('id', authData.user.id);
      await client.auth.admin.deleteUser(authData.user.id);

      return failure(
        500,
        onboardingErrorCodes.termsAgreementFailed,
        termsError.message || 'Failed to save terms agreement'
      );
    }

    // 4. 응답 데이터 생성
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