import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { z } from 'zod';
import {
  EnrollmentRequestSchema,
} from '@/features/enrollments/backend/schema';
import {
  createEnrollment,
  checkEnrollmentStatus,
} from '@/features/enrollments/backend/service';
import {
  enrollmentErrorCodes,
} from '@/features/enrollments/backend/error';

const EnrollmentStatusParamsSchema = z.object({
  courseId: z.string().uuid({ message: 'Course id must be a valid UUID.' }),
  userId: z.string().uuid({ message: 'User id must be a valid UUID.' }),
});

export const registerEnrollmentsRoutes = (app: Hono<AppEnv>) => {
  // POST /api/enrollments - Create a new enrollment
  app.post('/api/enrollments', async (c) => {
    const body = await c.req.json();
    const parsedBody = EnrollmentRequestSchema.safeParse(body);

    if (!parsedBody.success) {
      return respond(
        c,
        failure(
          400,
          enrollmentErrorCodes.enrollmentFailed,
          'Invalid request body',
          parsedBody.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    logger.info('Creating enrollment', parsedBody.data);

    const result = await createEnrollment(
      supabase,
      parsedBody.data.courseId,
      parsedBody.data.userId
    );

    if (!result.ok) {
      logger.error('Failed to create enrollment', result);
    }

    return respond(c, result);
  });

  // GET /api/enrollments/status - Check enrollment status
  app.get('/api/enrollments/status', async (c) => {
    const query = c.req.query();
    const parsedQuery = EnrollmentStatusParamsSchema.safeParse(query);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          enrollmentErrorCodes.enrollmentFailed,
          'Invalid query parameters',
          parsedQuery.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    logger.info('Checking enrollment status', parsedQuery.data);

    const result = await checkEnrollmentStatus(
      supabase,
      parsedQuery.data.courseId,
      parsedQuery.data.userId
    );

    if (!result.ok) {
      logger.error('Failed to check enrollment status', result);
    }

    return respond(c, result);
  });
};