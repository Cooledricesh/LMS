import { Hono } from 'hono';
import { respond } from '@/backend/http/response';
import { getLearnerGrades } from './service';
import type { AppEnv } from '@/backend/hono/context';

const gradesRoutes = new Hono<AppEnv>();

/**
 * GET /api/grades
 * 학습자 성적 조회
 */
gradesRoutes.get('/', async (c) => {
  try {
    // 1. x-user-id 헤더 검증
    const userId = c.req.header('x-user-id');
    if (!userId) {
      return c.json(
        { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
        401
      );
    }

    // 2. service 호출
    const supabase = c.get('supabase');
    const result = await getLearnerGrades(supabase, userId);

    // 3. respond 반환
    return respond(c, result);
  } catch (error) {
    console.error('성적 조회 API 오류:', error);
    return c.json(
      { error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다' } },
      500
    );
  }
});

export const registerGradesRoutes = (app: Hono<AppEnv>) => {
  app.route('/api/grades', gradesRoutes);
};
