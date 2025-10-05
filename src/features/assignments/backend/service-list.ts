import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  AssignmentTableRowSchema,
  SubmissionTableRowSchema,
  type AssignmentListItem,
  type AssignmentTableRow,
  type SubmissionTableRow,
} from '@/features/assignments/backend/schema';
import {
  assignmentErrorCodes,
  type AssignmentServiceError,
} from '@/features/assignments/backend/error';

const ASSIGNMENTS_TABLE = 'assignments';
const COURSES_TABLE = 'courses';
const SUBMISSIONS_TABLE = 'submissions';
const ENROLLMENTS_TABLE = 'enrollments';

/**
 * Get assignments list for a course with submission status
 */
export const getCourseAssignmentsList = async (
  client: SupabaseClient,
  courseId: string,
  userId?: string
): Promise<HandlerResult<AssignmentListItem[], AssignmentServiceError, unknown>> => {
  try {
    // Build query for assignments
    const { data: assignments, error: assignmentsError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select(`
        *,
        course:courses!assignments_course_id_fkey (
          id,
          title
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'published')
      .order('due_date', { ascending: true });

    if (assignmentsError) {
      return failure(500, 'fetchError', assignmentsError.message);
    }

    if (!assignments || assignments.length === 0) {
      return success([]);
    }

    // Get submissions for the user if userId is provided
    let submissions: SubmissionTableRow[] = [];
    let isEnrolled = false;

    if (userId) {
      // Check enrollment
      const { data: enrollmentData } = await client
        .from(ENROLLMENTS_TABLE)
        .select('id')
        .eq('course_id', courseId)
        .eq('learner_id', userId)
        .single();

      isEnrolled = !!enrollmentData;

      if (isEnrolled) {
        // Get all submissions for this user and course
        const assignmentIds = assignments.map(a => a.id);
        const { data: submissionsData } = await client
          .from(SUBMISSIONS_TABLE)
          .select('*')
          .in('assignment_id', assignmentIds)
          .eq('learner_id', userId);

        if (submissionsData) {
          submissions = submissionsData
            .map(s => SubmissionTableRowSchema.safeParse(s))
            .filter(r => r.success)
            .map(r => r.data!);
        }
      }
    }

    // Transform to list items
    const result: AssignmentListItem[] = [];

    for (const assignment of assignments) {
      const assignmentRow = AssignmentTableRowSchema.safeParse(assignment);

      if (!assignmentRow.success) {
        console.error('Assignment validation failed:', assignmentRow.error);
        continue;
      }

      const courseName = assignment.course?.title || 'Unknown Course';

      // Find submission for this assignment
      const submission = submissions.find(s => s.assignment_id === assignmentRow.data.id);

      // Determine submission status
      let submissionStatus: 'not_submitted' | 'submitted' | 'graded' | 'resubmission_required' | null = null;
      let isLate: boolean | null = null;
      let score: number | null = null;

      if (isEnrolled) {
        if (!submission) {
          submissionStatus = 'not_submitted';
          isLate = false;
          score = null;
        } else {
          submissionStatus = submission.status;
          isLate = submission.is_late;
          score = submission.score;
        }
      }

      const listItem: AssignmentListItem = {
        id: assignmentRow.data.id,
        courseId: assignmentRow.data.course_id,
        courseName,
        title: assignmentRow.data.title,
        dueDate: assignmentRow.data.due_date,
        weight: Number(assignmentRow.data.weight),
        status: assignmentRow.data.status,
        submissionStatus,
        isLate,
        score,
      };

      result.push(listItem);
    }

    return success(result);
  } catch (error) {
    console.error('Failed to fetch course assignments list:', error);
    return failure(500, 'fetchError', 'Failed to fetch assignments list');
  }
};