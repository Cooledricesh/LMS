import type { SupabaseClient } from '@supabase/supabase-js';

export type UserRole = 'learner' | 'instructor';

/**
 * Check if user has a specific role
 */
export const checkUserRole = async (
  client: SupabaseClient,
  userId: string,
  requiredRole: UserRole
): Promise<boolean> => {
  try {
    const { data, error } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.role === requiredRole;
  } catch (error) {
    console.error('Failed to check user role:', error);
    return false;
  }
};

/**
 * Check if user is enrolled in a course
 */
export const checkEnrollment = async (
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const { data, error } = await client
      .from('enrollments')
      .select('id')
      .eq('learner_id', userId)
      .eq('course_id', courseId)
      .single();

    return !!data && !error;
  } catch (error) {
    console.error('Failed to check enrollment:', error);
    return false;
  }
};

/**
 * Check if user owns a course (is the instructor)
 */
export const checkCourseOwnership = async (
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> => {
  try {
    const { data, error } = await client
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.instructor_id === userId;
  } catch (error) {
    console.error('Failed to check course ownership:', error);
    return false;
  }
};

/**
 * Check if user can access an assignment
 * - Learners: must be enrolled in the course
 * - Instructors: must own the course
 */
export const checkAssignmentAccess = async (
  client: SupabaseClient,
  userId: string,
  assignmentId: string
): Promise<boolean> => {
  try {
    // First, get the assignment's course ID
    const { data: assignmentData, error: assignmentError } = await client
      .from('assignments')
      .select('course_id, status')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignmentData) {
      return false;
    }

    // Draft assignments can only be accessed by instructors
    if (assignmentData.status === 'draft') {
      return checkCourseOwnership(client, userId, assignmentData.course_id);
    }

    // Check user's role
    const { data: profileData, error: profileError } = await client
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      return false;
    }

    // Check access based on role
    if (profileData.role === 'learner') {
      return checkEnrollment(client, userId, assignmentData.course_id);
    } else if (profileData.role === 'instructor') {
      return checkCourseOwnership(client, userId, assignmentData.course_id);
    }

    return false;
  } catch (error) {
    console.error('Failed to check assignment access:', error);
    return false;
  }
};

/**
 * Permission helper for frontend components
 */
export class PermissionHelper {
  private role: UserRole | null = null;
  private userId: string | null = null;

  constructor(role?: UserRole, userId?: string) {
    this.role = role || null;
    this.userId = userId || null;
  }

  isLearner(): boolean {
    return this.role === 'learner';
  }

  isInstructor(): boolean {
    return this.role === 'instructor';
  }

  isAuthenticated(): boolean {
    return !!this.userId && !!this.role;
  }

  canSubmitAssignment(isEnrolled: boolean, assignmentStatus: string, canSubmit: boolean): boolean {
    return this.isLearner() && isEnrolled && canSubmit && assignmentStatus !== 'closed';
  }

  canViewSubmission(isEnrolled: boolean, hasSubmitted: boolean): boolean {
    return this.isLearner() && isEnrolled && hasSubmitted;
  }

  canGradeAssignment(): boolean {
    return this.isInstructor();
  }
}