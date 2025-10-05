import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  AssignmentManagementResponseSchema,
  AssignmentTableRowSchema,
  InstructorAssignmentListItemSchema,
  type CreateAssignmentRequest,
  type UpdateAssignmentRequest,
  type AssignmentManagementResponse,
  type InstructorAssignmentListItem,
} from './schema';
import { assignmentErrorCodes, type AssignmentServiceError } from './error';
import {
  validateAssignmentDates,
  checkInstructorPermission,
  checkAssignmentEditPermission,
  checkPublishPermission,
  checkClosePermission,
} from './policy';

const ASSIGNMENTS_TABLE = 'assignments';
const SUBMISSIONS_TABLE = 'submissions';

/**
 * 과제 생성
 */
export const createAssignment = async (
  client: SupabaseClient,
  data: CreateAssignmentRequest,
  instructorId: string
): Promise<HandlerResult<AssignmentManagementResponse, AssignmentServiceError, unknown>> => {
  try {
    // 1. 권한 검증
    const permissionCheck = await checkInstructorPermission(client, data.courseId, instructorId);
    if (!permissionCheck.valid) {
      return failure(
        403,
        permissionCheck.errorCode as AssignmentServiceError || 'permissionDenied',
        permissionCheck.reason || '권한이 없습니다'
      );
    }

    // 2. 날짜 검증
    const dateCheck = validateAssignmentDates(data.dueDate);
    if (!dateCheck.valid) {
      return failure(
        400,
        dateCheck.errorCode as AssignmentServiceError || 'invalidDueDate',
        dateCheck.reason || '유효하지 않은 마감일입니다'
      );
    }

    // 3. DB INSERT
    const { data: assignmentData, error: insertError } = await client
      .from(ASSIGNMENTS_TABLE)
      .insert({
        course_id: data.courseId,
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        weight: data.weight,
        allow_late: data.allowLate,
        allow_resubmission: data.allowResubmission,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError || !assignmentData) {
      console.error('과제 생성 실패:', insertError);
      return failure(500, 'createFailed', '과제 생성 중 오류가 발생했습니다');
    }

    // 4. 응답 생성
    const response: AssignmentManagementResponse = {
      id: assignmentData.id,
      courseId: assignmentData.course_id,
      title: assignmentData.title,
      description: assignmentData.description,
      dueDate: assignmentData.due_date,
      weight: Number(assignmentData.weight),
      allowLate: assignmentData.allow_late,
      allowResubmission: assignmentData.allow_resubmission,
      status: assignmentData.status,
      createdAt: assignmentData.created_at,
      updatedAt: assignmentData.updated_at,
    };

    const validated = AssignmentManagementResponseSchema.safeParse(response);
    if (!validated.success) {
      console.error('응답 검증 실패:', validated.error);
      return failure(500, 'createFailed', '응답 생성 중 오류가 발생했습니다');
    }

    return success(validated.data);
  } catch (error) {
    console.error('과제 생성 중 오류:', error);
    return failure(500, 'createFailed', '과제 생성 중 오류가 발생했습니다');
  }
};

/**
 * 과제 수정
 */
export const updateAssignment = async (
  client: SupabaseClient,
  assignmentId: string,
  data: UpdateAssignmentRequest,
  instructorId: string
): Promise<HandlerResult<AssignmentManagementResponse, AssignmentServiceError, unknown>> => {
  try {
    // 1. 과제 조회
    const { data: assignmentData, error: fetchError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignmentData) {
      return failure(404, 'notFound', '과제를 찾을 수 없습니다');
    }

    const assignmentValidation = AssignmentTableRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(500, 'fetchError', '과제 데이터 검증 실패');
    }

    const assignment = assignmentValidation.data;

    // 2. 권한 검증
    const permissionCheck = await checkInstructorPermission(
      client,
      assignment.course_id,
      instructorId
    );
    if (!permissionCheck.valid) {
      return failure(
        403,
        permissionCheck.errorCode as AssignmentServiceError || 'permissionDenied',
        permissionCheck.reason || '권한이 없습니다'
      );
    }

    // 3. 수정 가능 여부 검증
    const editCheck = checkAssignmentEditPermission(assignment);
    if (!editCheck.valid) {
      return failure(
        403,
        editCheck.errorCode as AssignmentServiceError || 'cannotEditClosed',
        editCheck.reason || '수정할 수 없습니다'
      );
    }

    // 4. 날짜 검증 (변경된 경우)
    if (data.dueDate) {
      const dateCheck = validateAssignmentDates(data.dueDate);
      if (!dateCheck.valid) {
        return failure(
          400,
          dateCheck.errorCode as AssignmentServiceError || 'invalidDueDate',
          dateCheck.reason || '유효하지 않은 마감일입니다'
        );
      }
    }

    // 5. DB UPDATE
    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.dueDate !== undefined) updatePayload.due_date = data.dueDate;
    if (data.weight !== undefined) updatePayload.weight = data.weight;
    if (data.allowLate !== undefined) updatePayload.allow_late = data.allowLate;
    if (data.allowResubmission !== undefined)
      updatePayload.allow_resubmission = data.allowResubmission;

    const { data: updatedData, error: updateError } = await client
      .from(ASSIGNMENTS_TABLE)
      .update(updatePayload)
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError || !updatedData) {
      console.error('과제 수정 실패:', updateError);
      return failure(500, 'updateFailed', '과제 수정 중 오류가 발생했습니다');
    }

    // 6. 응답 생성
    const response: AssignmentManagementResponse = {
      id: updatedData.id,
      courseId: updatedData.course_id,
      title: updatedData.title,
      description: updatedData.description,
      dueDate: updatedData.due_date,
      weight: Number(updatedData.weight),
      allowLate: updatedData.allow_late,
      allowResubmission: updatedData.allow_resubmission,
      status: updatedData.status,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
    };

    const validated = AssignmentManagementResponseSchema.safeParse(response);
    if (!validated.success) {
      console.error('응답 검증 실패:', validated.error);
      return failure(500, 'updateFailed', '응답 생성 중 오류가 발생했습니다');
    }

    return success(validated.data);
  } catch (error) {
    console.error('과제 수정 중 오류:', error);
    return failure(500, 'updateFailed', '과제 수정 중 오류가 발생했습니다');
  }
};

/**
 * 과제 게시
 */
export const publishAssignment = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string
): Promise<HandlerResult<AssignmentManagementResponse, AssignmentServiceError, unknown>> => {
  try {
    // 1. 과제 조회
    const { data: assignmentData, error: fetchError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignmentData) {
      return failure(404, 'notFound', '과제를 찾을 수 없습니다');
    }

    const assignmentValidation = AssignmentTableRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(500, 'fetchError', '과제 데이터 검증 실패');
    }

    const assignment = assignmentValidation.data;

    // 2. 권한 검증
    const permissionCheck = await checkInstructorPermission(
      client,
      assignment.course_id,
      instructorId
    );
    if (!permissionCheck.valid) {
      return failure(
        403,
        permissionCheck.errorCode as AssignmentServiceError || 'permissionDenied',
        permissionCheck.reason || '권한이 없습니다'
      );
    }

    // 3. 게시 가능 여부 검증
    const publishCheck = checkPublishPermission(assignment);
    if (!publishCheck.valid) {
      return failure(
        400,
        publishCheck.errorCode as AssignmentServiceError || 'alreadyPublished',
        publishCheck.reason || '게시할 수 없습니다'
      );
    }

    // 4. DB UPDATE
    const { data: updatedData, error: updateError } = await client
      .from(ASSIGNMENTS_TABLE)
      .update({ status: 'published' })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError || !updatedData) {
      console.error('과제 게시 실패:', updateError);
      return failure(500, 'updateFailed', '과제 게시 중 오류가 발생했습니다');
    }

    // 5. 응답 생성
    const response: AssignmentManagementResponse = {
      id: updatedData.id,
      courseId: updatedData.course_id,
      title: updatedData.title,
      description: updatedData.description,
      dueDate: updatedData.due_date,
      weight: Number(updatedData.weight),
      allowLate: updatedData.allow_late,
      allowResubmission: updatedData.allow_resubmission,
      status: updatedData.status,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
    };

    const validated = AssignmentManagementResponseSchema.safeParse(response);
    if (!validated.success) {
      console.error('응답 검증 실패:', validated.error);
      return failure(500, 'updateFailed', '응답 생성 중 오류가 발생했습니다');
    }

    return success(validated.data);
  } catch (error) {
    console.error('과제 게시 중 오류:', error);
    return failure(500, 'updateFailed', '과제 게시 중 오류가 발생했습니다');
  }
};

/**
 * 과제 마감
 */
export const closeAssignment = async (
  client: SupabaseClient,
  assignmentId: string,
  instructorId: string
): Promise<HandlerResult<AssignmentManagementResponse, AssignmentServiceError, unknown>> => {
  try {
    // 1. 과제 조회
    const { data: assignmentData, error: fetchError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('id', assignmentId)
      .single();

    if (fetchError || !assignmentData) {
      return failure(404, 'notFound', '과제를 찾을 수 없습니다');
    }

    const assignmentValidation = AssignmentTableRowSchema.safeParse(assignmentData);
    if (!assignmentValidation.success) {
      return failure(500, 'fetchError', '과제 데이터 검증 실패');
    }

    const assignment = assignmentValidation.data;

    // 2. 권한 검증
    const permissionCheck = await checkInstructorPermission(
      client,
      assignment.course_id,
      instructorId
    );
    if (!permissionCheck.valid) {
      return failure(
        403,
        permissionCheck.errorCode as AssignmentServiceError || 'permissionDenied',
        permissionCheck.reason || '권한이 없습니다'
      );
    }

    // 3. 마감 가능 여부 검증
    const closeCheck = checkClosePermission(assignment);
    if (!closeCheck.valid) {
      return failure(
        400,
        closeCheck.errorCode as AssignmentServiceError || 'cannotCloseDraft',
        closeCheck.reason || '마감할 수 없습니다'
      );
    }

    // 4. DB UPDATE
    const { data: updatedData, error: updateError } = await client
      .from(ASSIGNMENTS_TABLE)
      .update({ status: 'closed' })
      .eq('id', assignmentId)
      .select()
      .single();

    if (updateError || !updatedData) {
      console.error('과제 마감 실패:', updateError);
      return failure(500, 'updateFailed', '과제 마감 중 오류가 발생했습니다');
    }

    // 5. 응답 생성
    const response: AssignmentManagementResponse = {
      id: updatedData.id,
      courseId: updatedData.course_id,
      title: updatedData.title,
      description: updatedData.description,
      dueDate: updatedData.due_date,
      weight: Number(updatedData.weight),
      allowLate: updatedData.allow_late,
      allowResubmission: updatedData.allow_resubmission,
      status: updatedData.status,
      createdAt: updatedData.created_at,
      updatedAt: updatedData.updated_at,
    };

    const validated = AssignmentManagementResponseSchema.safeParse(response);
    if (!validated.success) {
      console.error('응답 검증 실패:', validated.error);
      return failure(500, 'updateFailed', '응답 생성 중 오류가 발생했습니다');
    }

    return success(validated.data);
  } catch (error) {
    console.error('과제 마감 중 오류:', error);
    return failure(500, 'updateFailed', '과제 마감 중 오류가 발생했습니다');
  }
};

/**
 * Instructor용 과제 목록 조회 (제출 통계 포함)
 */
export const getInstructorAssignments = async (
  client: SupabaseClient,
  courseId: string,
  instructorId: string
): Promise<HandlerResult<InstructorAssignmentListItem[], AssignmentServiceError, unknown>> => {
  try {
    // 1. 권한 검증
    const permissionCheck = await checkInstructorPermission(client, courseId, instructorId);
    if (!permissionCheck.valid) {
      return failure(
        403,
        permissionCheck.errorCode as AssignmentServiceError || 'permissionDenied',
        permissionCheck.reason || '권한이 없습니다'
      );
    }

    // 2. 과제 목록 조회
    const { data: assignmentsData, error: fetchError } = await client
      .from(ASSIGNMENTS_TABLE)
      .select('*')
      .eq('course_id', courseId)
      .order('due_date', { ascending: true });

    if (fetchError) {
      console.error('과제 목록 조회 실패:', fetchError);
      return failure(500, 'fetchError', '과제 목록 조회 중 오류가 발생했습니다');
    }

    if (!assignmentsData || assignmentsData.length === 0) {
      return success([]);
    }

    // 3. 각 과제별 제출 통계 조회
    const assignments: InstructorAssignmentListItem[] = [];

    for (const row of assignmentsData) {
      const assignmentValidation = AssignmentTableRowSchema.safeParse(row);
      if (!assignmentValidation.success) {
        console.error('과제 데이터 검증 실패:', assignmentValidation.error);
        continue;
      }

      const assignment = assignmentValidation.data;

      // 제출 통계 조회
      const { data: submissionsData } = await client
        .from(SUBMISSIONS_TABLE)
        .select('id, status')
        .eq('assignment_id', assignment.id);

      const totalSubmissions = submissionsData?.length || 0;
      const gradedSubmissions =
        submissionsData?.filter((s) => s.status === 'graded').length || 0;

      const item: InstructorAssignmentListItem = {
        id: assignment.id,
        courseId: assignment.course_id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        weight: Number(assignment.weight),
        allowLate: assignment.allow_late,
        allowResubmission: assignment.allow_resubmission,
        status: assignment.status,
        totalSubmissions,
        gradedSubmissions,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
      };

      const validated = InstructorAssignmentListItemSchema.safeParse(item);
      if (validated.success) {
        assignments.push(validated.data);
      }
    }

    return success(assignments);
  } catch (error) {
    console.error('과제 목록 조회 중 오류:', error);
    return failure(500, 'fetchError', '과제 목록 조회 중 오류가 발생했습니다');
  }
};
