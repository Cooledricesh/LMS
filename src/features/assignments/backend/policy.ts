import type { SupabaseClient } from '@supabase/supabase-js';
import type { AssignmentTableRow } from './schema';

const COURSES_TABLE = 'courses';
const PROFILES_TABLE = 'profiles';

/**
 * Policy check result
 */
export interface PolicyResult {
  valid: boolean;
  reason?: string;
  errorCode?: string;
}

/**
 * 마감일 검증 - 미래 날짜인지 확인
 */
export const validateAssignmentDates = (dueDate: string): PolicyResult => {
  const now = new Date();
  const due = new Date(dueDate);

  if (due <= now) {
    return {
      valid: false,
      reason: '마감일은 현재 시간 이후여야 합니다',
      errorCode: 'INVALID_DUE_DATE',
    };
  }

  return { valid: true };
};

/**
 * Instructor 권한 검증 - 코스 소유권 확인
 */
export const checkInstructorPermission = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<PolicyResult> => {
  try {
    // 1. 사용자가 instructor 역할인지 확인
    const { data: profile, error: profileError } = await client
      .from(PROFILES_TABLE)
      .select('role')
      .eq('id', instructorId)
      .single();

    if (profileError || !profile) {
      return {
        valid: false,
        reason: '사용자를 찾을 수 없습니다',
        errorCode: 'USER_NOT_FOUND',
      };
    }

    if (profile.role !== 'instructor') {
      return {
        valid: false,
        reason: '강사 권한이 필요합니다',
        errorCode: 'PERMISSION_DENIED',
      };
    }

    // 2. 코스 소유권 확인
    const { data: course, error: courseError } = await client
      .from(COURSES_TABLE)
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return {
        valid: false,
        reason: '코스를 찾을 수 없습니다',
        errorCode: 'COURSE_NOT_FOUND',
      };
    }

    if (course.instructor_id !== instructorId) {
      return {
        valid: false,
        reason: '이 코스에 대한 권한이 없습니다',
        errorCode: 'PERMISSION_DENIED',
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('권한 검증 중 오류:', error);
    return {
      valid: false,
      reason: '권한 검증 중 오류가 발생했습니다',
      errorCode: 'PERMISSION_CHECK_FAILED',
    };
  }
};

/**
 * 과제 수정 가능 여부 검증 - 마감된 과제는 수정 불가
 */
export const checkAssignmentEditPermission = (
  assignment: AssignmentTableRow
): PolicyResult => {
  if (assignment.status === 'closed') {
    return {
      valid: false,
      reason: '마감된 과제는 수정할 수 없습니다',
      errorCode: 'CANNOT_EDIT_CLOSED',
    };
  }

  return { valid: true };
};

/**
 * 과제 게시 가능 여부 검증
 */
export const checkPublishPermission = (
  assignment: AssignmentTableRow
): PolicyResult => {
  if (assignment.status === 'published') {
    return {
      valid: false,
      reason: '이미 게시된 과제입니다',
      errorCode: 'ALREADY_PUBLISHED',
    };
  }

  if (assignment.status === 'closed') {
    return {
      valid: false,
      reason: '마감된 과제는 다시 게시할 수 없습니다',
      errorCode: 'CANNOT_PUBLISH_CLOSED',
    };
  }

  return { valid: true };
};

/**
 * 과제 마감 가능 여부 검증
 */
export const checkClosePermission = (
  assignment: AssignmentTableRow
): PolicyResult => {
  if (assignment.status === 'draft') {
    return {
      valid: false,
      reason: '게시되지 않은 과제는 마감할 수 없습니다',
      errorCode: 'CANNOT_CLOSE_DRAFT',
    };
  }

  if (assignment.status === 'closed') {
    return {
      valid: false,
      reason: '이미 마감된 과제입니다',
      errorCode: 'ALREADY_CLOSED',
    };
  }

  return { valid: true };
};
