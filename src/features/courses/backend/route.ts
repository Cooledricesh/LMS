import type { Hono } from 'hono';
import { failure, respond } from '@/backend/http/response';
import { getLogger, getSupabase, type AppEnv } from '@/backend/hono/context';
import { z } from 'zod';
import {
  CourseListRequestSchema,
  type CourseListRequest,
} from '@/features/courses/backend/schema';
import { getCourseList, getCourseById, getInstructorDashboardStats } from '@/features/courses/backend/service';
import { getAuthUser } from '@/backend/middleware/auth';
import { courseErrorCodes, type CourseServiceError } from '@/features/courses/backend/error';

const CourseIdParamsSchema = z.object({
  id: z.string().uuid({ message: 'Course id must be a valid UUID.' }),
});

export const registerCoursesRoutes = (app: Hono<AppEnv>) => {
  // GET /api/courses - Get list of published courses
  app.get('/api/courses', async (c) => {
    const query = c.req.query();
    const parsedQuery = CourseListRequestSchema.safeParse(query);

    if (!parsedQuery.success) {
      return respond(
        c,
        failure(
          400,
          courseErrorCodes.invalidParams,
          'Invalid query parameters',
          parsedQuery.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    const { page, limit, sort, order, ...filters } = parsedQuery.data;
    const pagination = { page, limit, sort, order };

    logger.info('Fetching course list', { filters, pagination });

    const result = await getCourseList(supabase, filters, pagination);

    if (!result.ok) {
      logger.error('Failed to fetch course list', result);
    }

    return respond(c, result);
  });

  // GET /api/courses/:id - Get course details by ID
  app.get('/api/courses/:id', async (c) => {
    const parsedParams = CourseIdParamsSchema.safeParse({ id: c.req.param('id') });

    if (!parsedParams.success) {
      return respond(
        c,
        failure(
          400,
          courseErrorCodes.invalidParams,
          'The provided course id is invalid.',
          parsedParams.error.format()
        )
      );
    }

    const supabase = getSupabase(c);
    const logger = getLogger(c);

    // Get user ID from request context if available
    // This would come from auth middleware in a real implementation
    const userId = c.req.header('x-user-id'); // Placeholder for now

    logger.info('Fetching course details', { courseId: parsedParams.data.id, userId });

    const result = await getCourseById(supabase, parsedParams.data.id, userId);

    if (!result.ok) {
      logger.error('Failed to fetch course details', result);
    }

    return respond(c, result);
  });

  // GET /api/courses/instructor/dashboard/stats - Get instructor dashboard statistics
  app.get('/api/courses/instructor/dashboard/stats', async (c) => {
    const supabase = getSupabase(c);
    const logger = getLogger(c);
    const user = getAuthUser(c);

    if (!user) {
      return respond(
        c,
        failure(
          401,
          courseErrorCodes.invalidParams,
          'Authorization token required'
        )
      );
    }

    logger.info('Fetching instructor dashboard stats', { userId: user.id });

    const result = await getInstructorDashboardStats(supabase, user.id);

    if (!result.ok) {
      logger.error('Failed to fetch instructor dashboard stats', result);
    }

    return respond(c, result);
  });
};