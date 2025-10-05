import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { AppEnv } from '@/backend/hono/context';
import { respond, success, failure } from '@/backend/http/response';
import { LearnerService } from './service';
import { enrolledCoursesResponseSchema } from './schema';

export const learnerRoutes = new Hono<AppEnv>()
  // 수강 중인 코스 목록 조회
  .get('/enrolled-courses', async (c) => {
    const supabase = c.get('supabase');
    const logger = c.get('logger');

    try {
      // 현재 로그인한 사용자 확인
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Authentication required'));
      }

      // 수강생 역할 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile || profile.role !== 'learner') {
        return respond(c, failure(403, 'FORBIDDEN', 'Learner role required'));
      }

      const service = new LearnerService(supabase);
      const enrolledCourses = await service.getEnrolledCourses(user.id);

      // 스키마 검증
      const validated = enrolledCoursesResponseSchema.parse(enrolledCourses);

      return respond(c, success(validated));
    } catch (error) {
      return respond(c, failure(
        500,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Failed to fetch enrolled courses'
      ));
    }
  })

  // 수강 신청 상태 확인
  .get('/enrolled-courses/:courseId', async (c) => {
    const supabase = c.get('supabase');
    const courseId = c.req.param('courseId');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return respond(c, failure(401, 'UNAUTHORIZED', 'Authentication required'));
      }

      const service = new LearnerService(supabase);
      const isEnrolled = await service.checkEnrollment(user.id, courseId);

      return respond(c, success({ enrolled: isEnrolled }));
    } catch (error) {
      return respond(c, failure(
        500,
        'INTERNAL_ERROR',
        error instanceof Error ? error.message : 'Failed to check enrollment'
      ));
    }
  })

  // 수강 신청
  .post('/enrolled-courses',
    zValidator('json', z.object({
      courseId: z.string().uuid(),
    })),
    async (c) => {
      const supabase = c.get('supabase');
      const logger = c.get('logger');
      const { courseId } = c.req.valid('json');

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return respond(c, failure(401, 'UNAUTHORIZED', 'Authentication required'));
        }

        const service = new LearnerService(supabase);
        await service.enrollCourse(user.id, courseId);

        logger.info(`User ${user.id} enrolled in course ${courseId}`);

        return respond(c, success({ message: 'Successfully enrolled' }));
      } catch (error) {
        logger.error('Failed to enroll course:', error);
        return respond(c, failure(
          500,
          'INTERNAL_ERROR',
          error instanceof Error ? error.message : 'Failed to enroll course'
        ));
      }
    }
  )

  // 수강 진행률 업데이트
  .patch('/enrolled-courses/:courseId/progress',
    zValidator('json', z.object({
      progress: z.number().min(0).max(100),
    })),
    async (c) => {
      const supabase = c.get('supabase');
      const logger = c.get('logger');
      const courseId = c.req.param('courseId');
      const { progress } = c.req.valid('json');

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          return respond(c, failure(401, 'UNAUTHORIZED', 'Authentication required'));
        }

        const service = new LearnerService(supabase);
        await service.updateProgress(user.id, courseId, progress);

        logger.info(`Updated progress for user ${user.id} in course ${courseId}: ${progress}%`);

        return respond(c, success({ progress }));
      } catch (error) {
        logger.error('Failed to update progress:', error);
        return respond(c, failure(
          500,
          'INTERNAL_ERROR',
          error instanceof Error ? error.message : 'Failed to update progress'
        ));
      }
    }
  );

export function registerLearnerRoutes(app: Hono<AppEnv>) {
  app.route('/api/learner', learnerRoutes);
}