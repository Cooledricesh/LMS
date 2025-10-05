import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import { normalizeUrl, isSafeUrl } from '@/lib/validation/url';
import {
  SubmitAssignmentRequestSchema,
  SubmitAssignmentResponseSchema,
  AssignmentRowSchema,
  SubmissionRowSchema,
  type SubmitAssignmentRequest,
  type SubmitAssignmentResponse,
  type SubmissionRow
} from './schema';
import {
  submissionErrorCodes,
  type SubmissionServiceError
} from './error';
import { checkSubmissionPolicy, determineSubmissionStatus } from './policy';

const ASSIGNMENTS_TABLE = 'assignments';
const SUBMISSIONS_TABLE = 'submissions';
const ENROLLMENTS_TABLE = 'enrollments';
const PROFILES_TABLE = 'profiles';

/**
 * 과제 제출 서비스
 * @param client - Supabase 클라이언트
 * @param params - 제출 요청 파라미터
 * @param userId - 현재 사용자 ID
 * @returns 제출 결과
 */
export const submitAssignment = async (
  client: SupabaseClient,
  params: SubmitAssignmentRequest,
  userId: string
): Promise<HandlerResult<SubmitAssignmentResponse, SubmissionServiceError, unknown>> => {
  try {
    // 1. 요청 데이터 검증
    const validationResult = SubmitAssignmentRequestSchema.safeParse(params);
    if (!validationResult.success) {
      return failure(
        400,
        submissionErrorCodes.validationFailed,
        '입력값이 올바르지 않습니다'
      );
    }

    const { assignmentId, content, link } = validationResult.data;

    // 2. URL 검증 (제공된 경우)
    if (link && link !== null) {
      const normalizedUrl = normalizeUrl(link);
      if (!normalizedUrl || !isSafeUrl(normalizedUrl)) {
        return failure(
          400,
          submissionErrorCodes.validationFailed,
          '올바른 URL 형식을 입력해주세요'
        );
      }
    }

    // 3. 사용자 검증
    const { data: userProfile, error: userError } = await client
      .from(PROFILES_TABLE)
      .select('id, role')
      .eq('id', userId)
      .single();

    if (userError || !userProfile || userProfile.role !== 'learner') {
      return failure(
        403,
        submissionErrorCodes.invalidUser,
        '유효하지 않은 사용자입니다'
      );
    }

    // 4. 과제 정보 조회
    const { data: assignmentData, error: assignmentError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (assignmentError || !assignmentData) {
      return failure(
        404,
        submissionErrorCodes.assignmentNotFound,
        '과제를 찾을 수 없습니다'
      );
    }

    const assignmentValidation = AssignmentRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(
        500,
        submissionErrorCodes.databaseError,
        '데이터베이스 오류가 발생했습니다'
      );
    }

    const assignment = assignmentValidation.data;

    // 5. 수강 등록 확인
    const { data: enrollmentData, error: enrollmentError } = await client
      .from(ENROLLMENTS_TABLE)
      .select('id')
      .eq('course_id', assignment.course_id)
      .eq('learner_id', userId)
      .single();

    if (enrollmentError || !enrollmentData) {
      return failure(
        403,
        submissionErrorCodes.notEnrolled,
        '이 코스에 등록되지 않았습니다'
      );
    }

    // 6. 기존 제출물 확인
    const { data: existingSubmissionData } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('learner_id', userId)
      .single();

    let existingSubmission: SubmissionRow | null = null;
    if (existingSubmissionData) {
      const submissionValidation = SubmissionRowSchema.safeParse(existingSubmissionData);
      if (submissionValidation.success) {
        existingSubmission = submissionValidation.data;
      }
    }

    // 7. 제출 정책 확인
    const policyCheck = checkSubmissionPolicy(assignment, existingSubmission);
    if (!policyCheck.canSubmit) {
      return failure(
        403,
        policyCheck.errorCode || submissionErrorCodes.submissionFailed,
        policyCheck.reason || '제출 처리 중 오류가 발생했습니다'
      );
    }

    // 8. 제출물 저장/업데이트
    const now = new Date().toISOString();
    const status = determineSubmissionStatus(existingSubmission, !!existingSubmission);

    const submissionData = {
      assignment_id: assignmentId,
      learner_id: userId,
      content,
      link: link || null,
      is_late: policyCheck.isLate,
      status: status === 'resubmission' ? 'submitted' : status,
      submitted_at: now,
      score: null,
      feedback: null,
      graded_at: null
    };

    let submissionId: string;

    if (existingSubmission) {
      // 기존 제출물 업데이트
      const { data: updatedSubmission, error: updateError } = await client
        .from(SUBMISSIONS_TABLE)
        .update({
          content,
          link: link || null,
          is_late: policyCheck.isLate,
          status: 'submitted',
          submitted_at: now,
          score: null,
          feedback: null,
          graded_at: null,
          updated_at: now
        })
        .eq('id', existingSubmission.id)
        .select('id')
        .single();

      if (updateError || !updatedSubmission) {
        console.error('제출물 업데이트 실패:', updateError);
        return failure(
          500,
          submissionErrorCodes.submissionFailed,
          '제출 처리 중 오류가 발생했습니다'
        );
      }

      submissionId = updatedSubmission.id;
    } else {
      // 새 제출물 생성
      const { data: newSubmission, error: insertError } = await client
        .from(SUBMISSIONS_TABLE)
        .insert(submissionData)
        .select('id')
        .single();

      if (insertError || !newSubmission) {
        console.error('제출물 생성 실패:', insertError);
        return failure(
          500,
          submissionErrorCodes.submissionFailed,
          '제출 처리 중 오류가 발생했습니다'
        );
      }

      submissionId = newSubmission.id;
    }

    // 9. 응답 생성
    const response: SubmitAssignmentResponse = {
      submissionId,
      status: status === 'resubmission' ? 'resubmission' : 'submitted',
      isLate: policyCheck.isLate,
      submittedAt: now
    };

    const responseValidation = SubmitAssignmentResponseSchema.safeParse(response);
    if (!responseValidation.success) {
      console.error('응답 검증 실패:', responseValidation.error);
      return failure(
        500,
        submissionErrorCodes.submissionFailed,
        '제출 처리 중 오류가 발생했습니다'
      );
    }

    return success(responseValidation.data);
  } catch (error) {
    console.error('과제 제출 중 오류:', error);
    return failure(
      500,
      submissionErrorCodes.submissionFailed,
      '제출 처리 중 오류가 발생했습니다'
    );
  }
};

/**
 * 제출물 조회
 * @param client - Supabase 클라이언트
 * @param submissionId - 제출물 ID
 * @param userId - 현재 사용자 ID
 * @returns 제출물 정보
 */
export const getSubmission = async (
  client: SupabaseClient,
  submissionId: string,
  userId: string
): Promise<HandlerResult<SubmissionRow, SubmissionServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(SUBMISSIONS_TABLE)
      .select('*')
      .eq('id', submissionId)
      .eq('learner_id', userId)
      .single();

    if (error || !data) {
      return failure(
        404,
        submissionErrorCodes.assignmentNotFound,
        '제출물을 찾을 수 없습니다'
      );
    }

    const validation = SubmissionRowSchema.safeParse(data);
    if (!validation.success) {
      return failure(
        500,
        submissionErrorCodes.databaseError,
        '데이터베이스 오류가 발생했습니다'
      );
    }

    return success(validation.data);
  } catch (error) {
    console.error('제출물 조회 중 오류:', error);
    return failure(
      500,
      submissionErrorCodes.databaseError,
      '데이터베이스 오류가 발생했습니다'
    );
  }
};