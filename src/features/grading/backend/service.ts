import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  SubmissionForGradingSchema,
  GradeSubmissionRequestSchema,
  GradeSubmissionResponseSchema,
  SubmissionRowSchema,
  ProfileRowSchema,
  AssignmentRowSchema,
  CourseRowSchema,
  type SubmissionForGrading,
  type GradeSubmissionRequest,
  type GradeSubmissionResponse,
} from './schema';
import { gradingErrorCodes, type GradingServiceError } from './error';

const SUBMISSIONS_TABLE = 'submissions';
const ASSIGNMENTS_TABLE = 'assignments';
const COURSES_TABLE = 'courses';
const PROFILES_TABLE = 'profiles';

/**
 * 제출물 목록 조회 (instructor 권한 검증)
 */
export const getSubmissionsForGrading = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string
): Promise<HandlerResult<SubmissionForGrading[], GradingServiceError, unknown>> => {
  try {
    // 1. instructor 프로필 조회 (role 검증)
    const { data: instructorProfile, error: instructorError } = await client
      .from(PROFILES_TABLE)
      .select('id, name, role')
      .eq('id', instructorId)
      .single();

    if (instructorError || !instructorProfile) {
      return failure(401, gradingErrorCodes.unauthorized, '인증이 필요합니다');
    }

    const profileValidation = ProfileRowSchema.safeParse(instructorProfile);
    if (!profileValidation.success || profileValidation.data.role !== 'instructor') {
      return failure(403, gradingErrorCodes.invalidRole, '강사 권한이 필요합니다');
    }

    // 2. assignment 조회 및 instructor 소유 여부 확인
    const { data: assignmentData, error: assignmentError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignmentData) {
      return failure(404, gradingErrorCodes.assignmentNotFound, '과제를 찾을 수 없습니다');
    }

    const assignmentValidation = AssignmentRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const assignment = assignmentValidation.data;

    // 3. course 조회 및 instructor 소유 여부 확인
    const { data: courseData, error: courseError } = await client
      .from(COURSES_TABLE)
      .select('*')
      .eq('id', assignment.course_id)
      .single();

    if (courseError || !courseData) {
      return failure(404, gradingErrorCodes.assignmentNotFound, '코스를 찾을 수 없습니다');
    }

    const courseValidation = CourseRowSchema.safeParse(courseData);
    if (!courseValidation.success) {
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const course = courseValidation.data;

    // 강사 소유 여부 확인
    if (course.instructor_id !== instructorId) {
      return failure(403, gradingErrorCodes.forbidden, '접근 권한이 없습니다');
    }

    // 4. submissions 목록 조회 (learner 정보 JOIN)
    const { data: submissionsData, error: submissionsError } = await client
      .from(SUBMISSIONS_TABLE)
      .select(`
        *,
        learner:profiles!submissions_learner_id_fkey(id, name, role)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (submissionsError) {
      console.error('Submissions query error:', submissionsError);
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    if (!submissionsData || submissionsData.length === 0) {
      return success([]);
    }

    // 5. 응답 형식으로 변환
    const submissions: SubmissionForGrading[] = [];

    for (const row of submissionsData) {
      const submissionValidation = SubmissionRowSchema.safeParse(row);
      if (!submissionValidation.success) {
        console.error('Submission validation failed:', submissionValidation.error);
        continue;
      }

      const submission = submissionValidation.data;

      // learner 정보 검증
      let learnerName = 'Unknown';
      if (row.learner) {
        const learnerValidation = ProfileRowSchema.safeParse(row.learner);
        if (learnerValidation.success) {
          learnerName = learnerValidation.data.name;
        }
      }

      const submissionForGrading: SubmissionForGrading = {
        id: submission.id,
        assignmentId: submission.assignment_id,
        learnerId: submission.learner_id,
        learnerName,
        content: submission.content,
        link: submission.link,
        isLate: submission.is_late,
        status: submission.status,
        score: submission.score,
        feedback: submission.feedback,
        submittedAt: submission.submitted_at,
        gradedAt: submission.graded_at,
      };

      const validatedSubmission = SubmissionForGradingSchema.safeParse(submissionForGrading);
      if (validatedSubmission.success) {
        submissions.push(validatedSubmission.data);
      }
    }

    return success(submissions);
  } catch (error) {
    console.error('제출물 목록 조회 중 오류:', error);
    return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
  }
};

/**
 * 채점 처리 (권한 검증 + 상태 전환)
 */
export const gradeSubmission = async (
  client: SupabaseClient,
  submissionId: string,
  gradeData: GradeSubmissionRequest,
  instructorId: string
): Promise<HandlerResult<GradeSubmissionResponse, GradingServiceError, unknown>> => {
  try {
    // 1. 요청 데이터 검증
    const validationResult = GradeSubmissionRequestSchema.safeParse(gradeData);
    if (!validationResult.success) {
      return failure(
        400,
        gradingErrorCodes.validationFailed,
        '입력값이 올바르지 않습니다',
        validationResult.error.errors
      );
    }

    const { score, feedback, requestResubmission } = validationResult.data;

    // 2. instructor 프로필 조회 (role 검증)
    const { data: instructorProfile, error: instructorError } = await client
      .from(PROFILES_TABLE)
      .select('id, name, role')
      .eq('id', instructorId)
      .single();

    if (instructorError || !instructorProfile) {
      return failure(401, gradingErrorCodes.unauthorized, '인증이 필요합니다');
    }

    const profileValidation = ProfileRowSchema.safeParse(instructorProfile);
    if (!profileValidation.success || profileValidation.data.role !== 'instructor') {
      return failure(403, gradingErrorCodes.invalidRole, '강사 권한이 필요합니다');
    }

    // 3. submission 조회
    const { data: submissionData, error: submissionError } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('id', submissionId)
      .single();

    if (submissionError || !submissionData) {
      return failure(404, gradingErrorCodes.submissionNotFound, '제출물을 찾을 수 없습니다');
    }

    const submissionValidation = SubmissionRowSchema.safeParse(submissionData);
    if (!submissionValidation.success) {
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const submission = submissionValidation.data;

    // 4. assignment → course → instructor 권한 검증
    const { data: assignmentData, error: assignmentError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', submission.assignment_id)
      .single();

    if (assignmentError || !assignmentData) {
      return failure(404, gradingErrorCodes.assignmentNotFound, '과제를 찾을 수 없습니다');
    }

    const assignmentValidation = AssignmentRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const assignment = assignmentValidation.data;

    const { data: courseData, error: courseError } = await client
      .from(COURSES_TABLE)
      .select('*')
      .eq('id', assignment.course_id)
      .single();

    if (courseError || !courseData) {
      return failure(404, gradingErrorCodes.assignmentNotFound, '코스를 찾을 수 없습니다');
    }

    const courseValidation = CourseRowSchema.safeParse(courseData);
    if (!courseValidation.success) {
      return failure(500, gradingErrorCodes.databaseError, '데이터베이스 오류가 발생했습니다');
    }

    const course = courseValidation.data;

    // 강사 소유 여부 확인
    if (course.instructor_id !== instructorId) {
      return failure(403, gradingErrorCodes.forbidden, '접근 권한이 없습니다');
    }

    // 5. 상태 결정
    const newStatus = requestResubmission ? 'resubmission_required' : 'graded';
    const now = new Date().toISOString();

    // 6. submissions 업데이트
    const { data: updatedSubmission, error: updateError } = await client
      .from(SUBMISSIONS_TABLE)
      .update({
        score,
        feedback,
        status: newStatus,
        graded_at: now,
        updated_at: now,
      })
      .eq('id', submissionId)
      .select('id, status, score, graded_at')
      .single();

    if (updateError || !updatedSubmission) {
      console.error('Submission update error:', updateError);
      return failure(500, gradingErrorCodes.gradingFailed, '채점 처리 중 오류가 발생했습니다');
    }

    // 7. 응답 생성
    const response: GradeSubmissionResponse = {
      submissionId: updatedSubmission.id,
      status: updatedSubmission.status as 'graded' | 'resubmission_required',
      score: updatedSubmission.score || score,
      gradedAt: updatedSubmission.graded_at || now,
    };

    const responseValidation = GradeSubmissionResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('Response validation failed:', responseValidation.error);
      return failure(500, gradingErrorCodes.gradingFailed, '채점 처리 중 오류가 발생했습니다');
    }

    return success(responseValidation.data);
  } catch (error) {
    console.error('채점 처리 중 오류:', error);
    return failure(500, gradingErrorCodes.gradingFailed, '채점 처리 중 오류가 발생했습니다');
  }
};
