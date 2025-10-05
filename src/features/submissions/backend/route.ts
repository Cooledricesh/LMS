import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '@/backend/http/response';
import { submitAssignment, getSubmission } from './service';
import { SubmitAssignmentRequestSchema } from './schema';
import type { AppEnv } from '@/backend/hono/context';

const submissionRoutes = new Hono<AppEnv>();

/**
 * POST /api/submissions
 * 과제 제출
 */
submissionRoutes.post('/', async (c) => {
  try {
    // 1. 인증된 사용자 ID 가져오기 (헤더에서)
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        401
      );
    }

    // 2. 요청 본문 파싱
    const body = await c.req.json();

    // 3. 요청 데이터 검증
    const validation = SubmitAssignmentRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: '입력값이 올바르지 않습니다',
            details: validation.error.errors
          }
        },
        400
      );
    }

    // 4. 서비스 호출
    const supabase = c.get('supabase');
    const result = await submitAssignment(supabase, validation.data, userId);

    // 5. 응답 반환
    return respond(c, result);
  } catch (error) {
    console.error('제출 API 오류:', error);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      500
    );
  }
});

/**
 * GET /api/submissions/:id
 * 제출물 조회
 */
submissionRoutes.get('/:id', async (c) => {
  try {
    const submissionId = c.req.param('id');
    const userId = c.req.header('x-user-id');

    if (!userId) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        401
      );
    }

    // ID 검증
    const idValidation = z.string().uuid().safeParse(submissionId);
    if (!idValidation.success) {
      return c.json(
        { error: { code: 'INVALID_ID', message: '유효하지 않은 제출물 ID입니다' } },
        400
      );
    }

    const supabase = c.get('supabase');
    const result = await getSubmission(supabase, submissionId, userId);

    return respond(c, result);
  } catch (error) {
    console.error('제출물 조회 오류:', error);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      500
    );
  }
});

export const registerSubmissionRoutes = (app: Hono<AppEnv>) => {
  app.route('/api/submissions', submissionRoutes);
};