import { Hono } from 'hono';
import { z } from 'zod';
import { respond } from '@/backend/http/response';
import { getAssignmentDetail, getAssignmentsByCourse } from '@/features/assignments/backend/service';
import { getCourseAssignmentsList } from '@/features/assignments/backend/service-list';
import {
  createAssignment,
  updateAssignment,
  publishAssignment,
  closeAssignment,
  getInstructorAssignments,
} from '@/features/assignments/backend/service-management';
import { CreateAssignmentRequestSchema, UpdateAssignmentRequestSchema } from '@/features/assignments/backend/schema';
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
  const result = await getCourseAssignmentsList(supabase, courseId, userId);

  return respond(c, result);
});

/**
 * POST /api/assignments
 * Create a new assignment
 */
assignmentRoutes.post('/', async (c) => {
  const userId = c.req.header('x-user-id');

  if (!userId) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      401
    );
  }

  const userIdValidation = z.string().uuid().safeParse(userId);
  if (!userIdValidation.success) {
    return c.json(
      { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
      400
    );
  }

  const body = await c.req.json();
  const validation = CreateAssignmentRequestSchema.safeParse(body);

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

  const supabase = c.get('supabase');
  const result = await createAssignment(supabase, validation.data, userId);

  return respond(c, result);
});

/**
 * PATCH /api/assignments/:id
 * Update an assignment
 */
assignmentRoutes.patch('/:id', async (c) => {
  const userId = c.req.header('x-user-id');

  if (!userId) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      401
    );
  }

  const assignmentId = c.req.param('id');
  const idValidation = z.string().uuid().safeParse(assignmentId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_ASSIGNMENT_ID', message: 'Invalid assignment ID format' } },
      400
    );
  }

  const userIdValidation = z.string().uuid().safeParse(userId);
  if (!userIdValidation.success) {
    return c.json(
      { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
      400
    );
  }

  const body = await c.req.json();
  const validation = UpdateAssignmentRequestSchema.safeParse(body);

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

  const supabase = c.get('supabase');
  const result = await updateAssignment(supabase, assignmentId, validation.data, userId);

  return respond(c, result);
});

/**
 * PATCH /api/assignments/:id/publish
 * Publish an assignment
 */
assignmentRoutes.patch('/:id/publish', async (c) => {
  const userId = c.req.header('x-user-id');

  if (!userId) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      401
    );
  }

  const assignmentId = c.req.param('id');
  const idValidation = z.string().uuid().safeParse(assignmentId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_ASSIGNMENT_ID', message: 'Invalid assignment ID format' } },
      400
    );
  }

  const userIdValidation = z.string().uuid().safeParse(userId);
  if (!userIdValidation.success) {
    return c.json(
      { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
      400
    );
  }

  const supabase = c.get('supabase');
  const result = await publishAssignment(supabase, assignmentId, userId);

  return respond(c, result);
});

/**
 * PATCH /api/assignments/:id/close
 * Close an assignment
 */
assignmentRoutes.patch('/:id/close', async (c) => {
  const userId = c.req.header('x-user-id');

  if (!userId) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      401
    );
  }

  const assignmentId = c.req.param('id');
  const idValidation = z.string().uuid().safeParse(assignmentId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_ASSIGNMENT_ID', message: 'Invalid assignment ID format' } },
      400
    );
  }

  const userIdValidation = z.string().uuid().safeParse(userId);
  if (!userIdValidation.success) {
    return c.json(
      { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
      400
    );
  }

  const supabase = c.get('supabase');
  const result = await closeAssignment(supabase, assignmentId, userId);

  return respond(c, result);
});

/**
 * GET /api/assignments/instructor/:courseId
 * Get all assignments for a course (instructor view with submission stats)
 */
assignmentRoutes.get('/instructor/:courseId', async (c) => {
  const userId = c.req.header('x-user-id');

  if (!userId) {
    return c.json(
      { error: { code: 'UNAUTHORIZED', message: '인증이 필요합니다' } },
      401
    );
  }

  const courseId = c.req.param('courseId');
  const idValidation = z.string().uuid().safeParse(courseId);
  if (!idValidation.success) {
    return c.json(
      { error: { code: 'INVALID_COURSE_ID', message: 'Invalid course ID format' } },
      400
    );
  }

  const userIdValidation = z.string().uuid().safeParse(userId);
  if (!userIdValidation.success) {
    return c.json(
      { error: { code: 'INVALID_USER_ID', message: 'Invalid user ID format' } },
      400
    );
  }

  const supabase = c.get('supabase');
  const result = await getInstructorAssignments(supabase, courseId, userId);

  return respond(c, result);
});

export const registerAssignmentRoutes = (app: Hono<AppEnv>) => {
  app.route('/api/assignments', assignmentRoutes);
};