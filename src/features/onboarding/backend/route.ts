import type { Hono } from 'hono';
import {
  failure,
  respond,
  type ErrorResult,
} from '@/backend/http/response';
import {
  getLogger,
  getSupabase,
  type AppEnv,
} from '@/backend/hono/context';
import { CreateProfileRequestSchema } from '@/features/onboarding/backend/schema';
import { createUserProfile } from './service';
import {
  onboardingErrorCodes,
  type OnboardingServiceError,
} from './error';

export const registerOnboardingRoutes = (app: Hono<AppEnv>) => {
  // 프로필 생성 엔드포인트 (Auth는 클라이언트에서 처리)
  app.post('/api/onboarding/create-profile', async (c) => {
    const logger = getLogger(c);

    // Content-Type 확인
    const contentType = c.req.header('content-type');
    if (!contentType?.includes('application/json')) {
      return respond(
        c,
        failure(
          400,
          'INVALID_CONTENT_TYPE',
          'Content-Type must be application/json'
        )
      );
    }

    let body;
    try {
      body = await c.req.json();
    } catch (error) {
      logger.error('Failed to parse request body', error);
      return respond(
        c,
        failure(
          400,
          'INVALID_JSON',
          'Invalid JSON in request body'
        )
      );
    }

    const parsedRequest = CreateProfileRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return respond(
        c,
        failure(
          400,
          onboardingErrorCodes.invalidInput,
          'Invalid profile data',
          parsedRequest.error.format()
        )
      );
    }

    // IP 주소와 User Agent 추출
    const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] ||
                     c.req.header('x-real-ip') ||
                     undefined;
    const userAgent = c.req.header('user-agent') || undefined;

    const supabase = getSupabase(c);
    const result = await createUserProfile(
      supabase,
      parsedRequest.data,
      ipAddress,
      userAgent
    );

    if (!result.ok) {
      const errorResult = result as ErrorResult<OnboardingServiceError, unknown>;

      // 특정 에러 로깅
      if (errorResult.error.code === onboardingErrorCodes.profileCreationFailed ||
          errorResult.error.code === onboardingErrorCodes.termsAgreementFailed) {
        logger.error('Profile creation failed', {
          code: errorResult.error.code,
          message: errorResult.error.message,
          userId: parsedRequest.data.userId,
          email: parsedRequest.data.email,
        });
      }

      return respond(c, result);
    }

    logger.info('User profile created successfully', {
      userId: result.data.userId,
      email: result.data.email,
      role: result.data.role,
    });

    return respond(c, result);
  });
};