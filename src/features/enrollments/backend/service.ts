import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  EnrollmentResponseSchema,
  EnrollmentTableRowSchema,
  type EnrollmentResponse,
  type EnrollmentStatus,
  type EnrollmentTableRow,
} from '@/features/enrollments/backend/schema';
import {
  enrollmentErrorCodes,
  type EnrollmentServiceError,
} from '@/features/enrollments/backend/error';

const ENROLLMENTS_TABLE = 'enrollments';
const COURSES_TABLE = 'courses';
const PROFILES_TABLE = 'profiles';

/**
 * Create a new enrollment
 */
export const createEnrollment = async (
  client: SupabaseClient,
  courseId: string,
  learnerId: string
): Promise<HandlerResult<EnrollmentResponse, EnrollmentServiceError, unknown>> => {
  try {
    // First, verify that the user has learner role
    const { data: profileData } = await client
      .from(PROFILES_TABLE)
      .select('role')
      .eq('id', learnerId)
      .single();

    if (!profileData || profileData.role !== 'learner') {
      return failure(401, enrollmentErrorCodes.unauthorized, 'Only learners can enroll in courses');
    }

    // Check if course exists and is published
    const { data: courseData } = await client
      .from(COURSES_TABLE)
      .select('status')
      .eq('id', courseId)
      .single();

    if (!courseData) {
      return failure(404, enrollmentErrorCodes.courseNotAvailable, 'Course not found');
    }

    if (courseData.status !== 'published') {
      return failure(400, enrollmentErrorCodes.courseNotAvailable, 'Course is not available for enrollment');
    }

    // Check for existing enrollment
    const { data: existingEnrollment } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('course_id', courseId)
      .eq('learner_id', learnerId)
      .single();

    if (existingEnrollment) {
      return failure(409, enrollmentErrorCodes.alreadyEnrolled, 'Already enrolled in this course');
    }

    // Create new enrollment
    const { data, error } = await client
      .from(ENROLLMENTS_TABLE)
      .insert({
        course_id: courseId,
        learner_id: learnerId,
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Enrollment creation failed:', error);
      return failure(500, enrollmentErrorCodes.enrollmentFailed, error.message);
    }

    const rowParse = EnrollmentTableRowSchema.safeParse(data);

    if (!rowParse.success) {
      return failure(
        500,
        enrollmentErrorCodes.enrollmentFailed,
        'Enrollment data validation failed',
        rowParse.error.format()
      );
    }

    const enrollment: EnrollmentResponse = {
      id: rowParse.data.id,
      courseId: rowParse.data.course_id,
      learnerId: rowParse.data.learner_id,
      enrolledAt: rowParse.data.enrolled_at,
      createdAt: rowParse.data.created_at,
      updatedAt: rowParse.data.updated_at,
    };

    const validatedEnrollment = EnrollmentResponseSchema.safeParse(enrollment);

    if (!validatedEnrollment.success) {
      return failure(
        500,
        enrollmentErrorCodes.enrollmentFailed,
        'Enrollment response validation failed',
        validatedEnrollment.error.format()
      );
    }

    return success(validatedEnrollment.data);
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    return failure(500, enrollmentErrorCodes.enrollmentFailed, 'Failed to create enrollment');
  }
};

/**
 * Check enrollment status for a course
 */
export const checkEnrollmentStatus = async (
  client: SupabaseClient,
  courseId: string,
  learnerId: string
): Promise<HandlerResult<EnrollmentStatus, EnrollmentServiceError, unknown>> => {
  try {
    const { data } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('course_id', courseId)
      .eq('learner_id', learnerId)
      .single();

    const status: EnrollmentStatus = {
      isEnrolled: !!data,
      enrollmentId: data?.id || null,
    };

    return success(status);
  } catch (error) {
    console.error('Failed to check enrollment status:', error);
    return failure(500, enrollmentErrorCodes.enrollmentFailed, 'Failed to check enrollment status');
  }
};

/**
 * Get all enrollments for a course
 */
export const getEnrollmentsByCourse = async (
  client: SupabaseClient,
  courseId: string
): Promise<HandlerResult<EnrollmentResponse[], EnrollmentServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(ENROLLMENTS_TABLE)
      .select('*')
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      return failure(500, enrollmentErrorCodes.enrollmentFailed, error.message);
    }

    if (!data) {
      return success([]);
    }

    const enrollments: EnrollmentResponse[] = [];

    for (const row of data) {
      const rowParse = EnrollmentTableRowSchema.safeParse(row);

      if (!rowParse.success) {
        console.error('Enrollment validation failed:', rowParse.error);
        continue;
      }

      const enrollment: EnrollmentResponse = {
        id: rowParse.data.id,
        courseId: rowParse.data.course_id,
        learnerId: rowParse.data.learner_id,
        enrolledAt: rowParse.data.enrolled_at,
        createdAt: rowParse.data.created_at,
        updatedAt: rowParse.data.updated_at,
      };

      const validatedEnrollment = EnrollmentResponseSchema.safeParse(enrollment);

      if (!validatedEnrollment.success) {
        console.error('Enrollment response validation failed:', validatedEnrollment.error);
        continue;
      }

      enrollments.push(validatedEnrollment.data);
    }

    return success(enrollments);
  } catch (error) {
    console.error('Failed to fetch enrollments by course:', error);
    return failure(500, enrollmentErrorCodes.enrollmentFailed, 'Failed to fetch enrollments');
  }
};