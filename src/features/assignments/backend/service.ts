import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  AssignmentDetailResponseSchema,
  AssignmentTableRowSchema,
  SubmissionTableRowSchema,
  type AssignmentDetailResponse,
  type AssignmentTableRow,
  type SubmissionTableRow,
} from '@/features/assignments/backend/schema';
import {
  assignmentErrorCodes,
  type AssignmentServiceError,
} from '@/features/assignments/backend/error';

const ASSIGNMENTS_TABLE = 'assignments';
const COURSES_TABLE = 'courses';
const PROFILES_TABLE = 'profiles';
const ENROLLMENTS_TABLE = 'enrollments';
const SUBMISSIONS_TABLE = 'submissions';

/**
 * Get assignment detail by ID with enrollment status and submission
 */
export const getAssignmentDetail = async (
  client: SupabaseClient,
  assignmentId: string,
  userId?: string
): Promise<HandlerResult<AssignmentDetailResponse, AssignmentServiceError, unknown>> => {
  try {
    // Fetch assignment with course and instructor info
    const { data: assignmentData, error: assignmentError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select(`
        *,
        course:courses!assignments_course_id_fkey (
          id,
          title,
          instructor:profiles!courses_instructor_id_fkey (
            id,
            name
          )
        )
      `)
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignmentData) {
      return failure(404, 'notFound', 'Assignment not found');
    }

    const assignmentRow = AssignmentTableRowSchema.safeParse(assignmentData);

    if (!assignmentRow.success) {
      return failure(500, 'fetchError', 'Assignment data validation failed');
    }

    // Check if assignment is published (only published assignments can be accessed by learners)
    if (assignmentRow.data.status === 'draft') {
      return failure(404, 'notFound', 'Assignment not found');
    }

    // Extract course and instructor info
    const course = assignmentData.course;
    if (!course) {
      return failure(404, 'courseNotFound', 'Course not found');
    }

    const courseName = course.title;
    const instructorName = course.instructor?.name || 'Unknown Instructor';

    // Check enrollment status and get submission if userId provided
    let isEnrolled = false;
    let submission: SubmissionTableRow | null = null;

    if (userId) {
      // Check if user is enrolled in the course
      const { data: enrollmentData } = await client
        .from(ENROLLMENTS_TABLE)
        .select('id')
        .eq('course_id', assignmentRow.data.course_id)
        .eq('learner_id', userId)
        .single();

      isEnrolled = !!enrollmentData;

      // Get user's submission if exists
      if (isEnrolled) {
        const { data: submissionData } = await client
          .from(SUBMISSIONS_TABLE)
          .select('*')
          .eq('assignment_id', assignmentId)
          .eq('learner_id', userId)
          .single();

        if (submissionData) {
          const submissionRow = SubmissionTableRowSchema.safeParse(submissionData);
          if (submissionRow.success) {
            submission = submissionRow.data;
          }
        }
      }
    }

    // Determine if user can submit
    const now = new Date();
    const dueDate = new Date(assignmentRow.data.due_date);
    const isPastDue = now > dueDate;

    let canSubmit = false;
    if (isEnrolled && assignmentRow.data.status === 'published') {
      if (!isPastDue) {
        // Before due date, can always submit
        canSubmit = true;
      } else if (assignmentRow.data.allow_late) {
        // After due date but late submission allowed
        canSubmit = true;
      }

      // Check if resubmission is needed/allowed
      if (submission) {
        if (submission.status === 'resubmission_required') {
          canSubmit = true;
        } else if (!assignmentRow.data.allow_resubmission && submission.status === 'submitted') {
          canSubmit = false;
        }
      }
    }

    // If assignment is closed, cannot submit
    if (assignmentRow.data.status === 'closed') {
      canSubmit = false;
    }

    const assignmentDetail: AssignmentDetailResponse = {
      id: assignmentRow.data.id,
      courseId: assignmentRow.data.course_id,
      title: assignmentRow.data.title,
      description: assignmentRow.data.description,
      dueDate: assignmentRow.data.due_date,
      weight: Number(assignmentRow.data.weight),
      allowLate: assignmentRow.data.allow_late,
      allowResubmission: assignmentRow.data.allow_resubmission,
      status: assignmentRow.data.status,
      canSubmit,
      isEnrolled,
      hasSubmitted: !!submission,
      submission: submission ? {
        id: submission.id,
        content: submission.content,
        link: submission.link,
        isLate: submission.is_late,
        status: submission.status,
        score: submission.score ? Number(submission.score) : null,
        feedback: submission.feedback,
        submittedAt: submission.submitted_at,
        gradedAt: submission.graded_at,
      } : null,
      courseName,
      instructorName,
      createdAt: assignmentRow.data.created_at,
      updatedAt: assignmentRow.data.updated_at,
    };

    const validatedDetail = AssignmentDetailResponseSchema.safeParse(assignmentDetail);

    if (!validatedDetail.success) {
      console.error('Assignment detail validation failed:', validatedDetail.error);
      return failure(500, 'fetchError', 'Assignment detail validation failed');
    }

    return success(validatedDetail.data);
  } catch (error) {
    console.error('Failed to fetch assignment detail:', error);
    return failure(500, 'fetchError', 'Failed to fetch assignment detail');
  }
};

/**
 * Get assignments for a course
 */
export const getAssignmentsByCourse = async (
  client: SupabaseClient,
  courseId: string,
  userId?: string
): Promise<HandlerResult<AssignmentDetailResponse[], AssignmentServiceError, unknown>> => {
  try {
    // Build query for assignments
    const query = client
      .from(ASSIGNMENTS_TABLE)
      .select(`
        *,
        course:courses!assignments_course_id_fkey (
          id,
          title,
          instructor:profiles!courses_instructor_id_fkey (
            id,
            name
          )
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'published')
      .order('due_date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      return failure(500, 'fetchError', error.message);
    }

    if (!data) {
      return success([]);
    }

    const assignments: AssignmentDetailResponse[] = [];

    for (const row of data) {
      const assignmentRow = AssignmentTableRowSchema.safeParse(row);

      if (!assignmentRow.success) {
        console.error('Assignment validation failed:', assignmentRow.error);
        continue;
      }

      // Extract course and instructor info
      const course = row.course;
      if (!course) continue;

      const courseName = course.title;
      const instructorName = course.instructor?.name || 'Unknown Instructor';

      // Check enrollment and submission for each assignment
      let isEnrolled = false;
      let submission: SubmissionTableRow | null = null;

      if (userId) {
        // Check enrollment
        const { data: enrollmentData } = await client
          .from(ENROLLMENTS_TABLE)
          .select('id')
          .eq('course_id', courseId)
          .eq('learner_id', userId)
          .single();

        isEnrolled = !!enrollmentData;

        // Get submission
        if (isEnrolled) {
          const { data: submissionData } = await client
            .from(SUBMISSIONS_TABLE)
            .select('*')
            .eq('assignment_id', assignmentRow.data.id)
            .eq('learner_id', userId)
            .single();

          if (submissionData) {
            const submissionRow = SubmissionTableRowSchema.safeParse(submissionData);
            if (submissionRow.success) {
              submission = submissionRow.data;
            }
          }
        }
      }

      // Determine if user can submit
      const now = new Date();
      const dueDate = new Date(assignmentRow.data.due_date);
      const isPastDue = now > dueDate;

      let canSubmit = false;
      if (isEnrolled && assignmentRow.data.status === 'published') {
        if (!isPastDue) {
          canSubmit = true;
        } else if (assignmentRow.data.allow_late) {
          canSubmit = true;
        }

        if (submission) {
          if (submission.status === 'resubmission_required') {
            canSubmit = true;
          } else if (!assignmentRow.data.allow_resubmission && submission.status === 'submitted') {
            canSubmit = false;
          }
        }
      }

      if (assignmentRow.data.status === 'closed') {
        canSubmit = false;
      }

      const assignmentDetail: AssignmentDetailResponse = {
        id: assignmentRow.data.id,
        courseId: assignmentRow.data.course_id,
        title: assignmentRow.data.title,
        description: assignmentRow.data.description,
        dueDate: assignmentRow.data.due_date,
        weight: Number(assignmentRow.data.weight),
        allowLate: assignmentRow.data.allow_late,
        allowResubmission: assignmentRow.data.allow_resubmission,
        status: assignmentRow.data.status,
        canSubmit,
        isEnrolled,
        hasSubmitted: !!submission,
        submission: submission ? {
          id: submission.id,
          content: submission.content,
          link: submission.link,
          isLate: submission.is_late,
          status: submission.status,
          score: submission.score ? Number(submission.score) : null,
          feedback: submission.feedback,
          submittedAt: submission.submitted_at,
          gradedAt: submission.graded_at,
        } : null,
        courseName,
        instructorName,
        createdAt: assignmentRow.data.created_at,
        updatedAt: assignmentRow.data.updated_at,
      };

      const validatedDetail = AssignmentDetailResponseSchema.safeParse(assignmentDetail);

      if (validatedDetail.success) {
        assignments.push(validatedDetail.data);
      }
    }

    return success(assignments);
  } catch (error) {
    console.error('Failed to fetch assignments by course:', error);
    return failure(500, 'fetchError', 'Failed to fetch assignments');
  }
};