import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '@/backend/http/response';
import { getAssignmentDetail, getAssignmentsByCourse } from '@/features/assignments/backend/service';
import type { AppEnv } from '@/backend/hono/context';

const assignmentRoutes = new Hono<AppEnv>();

/**
 * GET /api/assignments/:id
 * Get assignment detail by ID
 */
assignmentRoutes.get('/:id', async (c) => {
  const assignmentId = c.req.param('id');
  const userId = c.req.header('x-user-id');

  // Validate assignment ID
  const idValidation = z.string().uuid().safeParse(assignmentId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_ASSIGNMENT_ID', message: 'Invalid assignment ID format' } },
      400
    );
  }

  // Validate user ID if provided
  if (userId) {
    const userIdValidation = z.string().uuid().safeParse(userId);
    if (!userIdValidation.success) {
      return c.json(
        { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
        400
      );
    }
  }

  const supabase = c.get('supabase');
  const result = await getAssignmentDetail(supabase, assignmentId, userId);

  return respond(c, result);
});

/**
 * GET /api/assignments/course/:courseId
 * Get all assignments for a course
 */
assignmentRoutes.get('/course/:courseId', async (c) => {
  const courseId = c.req.param('courseId');
  const userId = c.req.header('x-user-id');

  // Validate course ID
  const idValidation = z.string().uuid().safeParse(courseId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_COURSE_ID', message: 'Invalid course ID format' } },
      400
    );
  }

  // Validate user ID if provided
  if (userId) {
    const userIdValidation = z.string().uuid().safeParse(userId);
    if (!userIdValidation.success) {
      return c.json(
        { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
        400
      );
    }
  }

  const supabase = c.get('supabase');
  const result = await getAssignmentsByCourse(supabase, courseId, userId);

  return respond(c, result);
});

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  app.route('/api/assignments', assignmentRoutes);
};