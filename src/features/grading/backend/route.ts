import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '@/backend/http/response';
import { getSubmissionsForGrading, gradeSubmission } from './service';
import { GradeSubmissionRequestSchema } from './schema';
import type { AppEnv } from '@/backend/hono/context';

const gradingRoutes = new Hono<AppEnv>();

/**
 * GET /api/grading/assignments/:assignmentId/submissions
 * 제출물 목록 조회 (instructor 권한)
 */
gradingRoutes.get('/assignments/:assignmentId/submissions', async (c) => {
  try {
    // 1. x-user-id 헤더 검증
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        401
      );
    }

    // 2. assignmentId 검증
    const assignmentId = c.req.param('assignmentId');
    const idValidation = z.string().uuid().safeParse(assignmentId);
    if (!idValidation.success) {
      return c.json(
        { error: { code: 'INVALID_ASSIGNMENT_ID', message: '유효하지 않은 과제 ID입니다' } },
        400
      );
    }

    // 3. service 호출
    const supabase = c.get('supabase');
    const result = await getSubmissionsForGrading(supabase, assignmentId, userId);

    // 4. respond 반환
    return respond(c, result);
  } catch (error) {
    console.error('제출물 목록 조회 API 오류:', error);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      500
    );
  }
});

/**
 * POST /api/grading/submissions/:submissionId
 * 채점 처리
 */
gradingRoutes.post('/submissions/:submissionId', async (c) => {
  try {
    // 1. x-user-id 헤더 검증
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        401
      );
    }

    // 2. submissionId 검증
    const submissionId = c.req.param('submissionId');
    const idValidation = z.string().uuid().safeParse(submissionId);
    if (!idValidation.success) {
      return c.json(
        { error: { code: 'INVALID_SUBMISSION_ID', message: '유효하지 않은 제출물 ID입니다' } },
        400
      );
    }

    // 3. 요청 body 검증
    const body = await c.req.json();
    const validation = GradeSubmissionRequestSchema.safeParse(body);
    if (!validation.success) {
      return c.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: '입력값이 올바르지 않습니다',
            details: validation.error.errors,
          },
        },
        400
      );
    }

    // 4. service 호출
    const supabase = c.get('supabase');
    const result = await gradeSubmission(supabase, submissionId, validation.data, userId);

    // 5. respond 반환
    return respond(c, result);
  } catch (error) {
    console.error('채점 API 오류:', error);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      500
    );
  }
});

export const registerGradingRoutes = (app: Hono<AppEnv>) => {
  app.route('/api/grading', gradingRoutes);
};
