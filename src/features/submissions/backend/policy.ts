import { checkDeadlinePolicy } from '@/lib/policies/date';
import type { AssignmentRow, SubmissionRow } from './schema';
import { submissionErrorCodes, type SubmissionServiceError } from './error';

export interface SubmissionPolicyCheck {
  canSubmit: boolean;
  isLate: boolean;
  reason?: string;
  errorCode?: SubmissionServiceError;
}

/**
 * 과제 제출 정책 검증
 * @param assignment - 과제 정보
 * @param existingSubmission - 기존 제출물 (있는 경우)
 * @param now - 현재 시간 (테스트용)
 * @returns 제출 가능 여부 및 정책 정보
 */
export const checkSubmissionPolicy = (
  assignment: AssignmentRow,
  existingSubmission: SubmissionRow | null,
  now: Date = new Date()
): SubmissionPolicyCheck => {
  // 1. 과제 상태 확인
  if (assignment.status === 'draft') {
    return {
      canSubmit: false,
      isLate: false,
      reason: '아직 게시되지 않은 과제입니다',
      errorCode: submissionErrorCodes.assignmentNotPublished
    };
  }

  if (assignment.status === 'closed') {
    return {
      canSubmit: false,
      isLate: false,
      reason: '마감된 과제입니다',
      errorCode: submissionErrorCodes.assignmentClosed
    };
  }

  // 2. 마감일 정책 확인
  const deadlineCheck = checkDeadlinePolicy(
    assignment.due_date,
    assignment.allow_late,
    now
  );

  // 3. 기존 제출물이 있는 경우
  if (existingSubmission) {
    // 재제출 요청 상태인 경우 항상 허용
    if (existingSubmission.status === 'resubmission_required') {
      return {
        canSubmit: true,
        isLate: deadlineCheck.isPastDue,
        reason: '재제출이 요청되었습니다'
      };
    }

    // 재제출 허용 여부 확인
    if (!assignment.allow_resubmission) {
      // 이미 제출한 경우 재제출 불가
      if (existingSubmission.status === 'submitted' || existingSubmission.status === 'graded') {
        return {
          canSubmit: false,
          isLate: false,
          reason: '재제출이 허용되지 않는 과제입니다',
          errorCode: submissionErrorCodes.resubmitNotAllowed
        };
      }
    }
  }

  // 4. 마감일 초과 및 지각 정책
  if (deadlineCheck.isPastDue) {
    if (!assignment.allow_late) {
      return {
        canSubmit: false,
        isLate: false,
        reason: '제출 기한이 지났습니다',
        errorCode: submissionErrorCodes.pastDueNoLate
      };
    }

    // 지각 제출 허용
    return {
      canSubmit: true,
      isLate: true,
      reason: '지각 제출이 허용된 과제입니다'
    };
  }

  // 5. 정상 제출 가능
  return {
    canSubmit: true,
    isLate: false
  };
};

/**
 * 제출물 상태 결정
 * @param existingSubmission - 기존 제출물
 * @param isResubmission - 재제출 여부
 * @returns 새로운 제출물 상태
 */
export const determineSubmissionStatus = (
  existingSubmission: SubmissionRow | null,
  isResubmission: boolean
): 'submitted' | 'resubmission' => {
  if (!existingSubmission) {
    return 'submitted';
  }

  if (existingSubmission.status === 'resubmission_required' || isResubmission) {
    return 'resubmission';
  }

  return 'submitted';
};

/**
 * 제출 가능 시간 확인
 * @param assignment - 과제 정보
 * @param now - 현재 시간
 * @returns 제출 가능한 시간 범위 정보
 */
export const getSubmissionTimeWindow = (
  assignment: AssignmentRow,
  now: Date = new Date()
): {
  isOpen: boolean;
  opensAt?: Date;
  closesAt?: Date;
  isUrgent: boolean;
} => {
  const dueDate = new Date(assignment.due_date);
  const isPublished = assignment.status === 'published';
  const isClosed = assignment.status === 'closed';

  if (!isPublished || isClosed) {
    return {
      isOpen: false,
      isUrgent: false
    };
  }

  const deadlineCheck = checkDeadlinePolicy(
    dueDate,
    assignment.allow_late,
    now
  );

  // 24시간 이내 마감인 경우 긴급
  const isUrgent = deadlineCheck.hoursRemaining !== undefined && deadlineCheck.hoursRemaining <= 24;

  return {
    isOpen: !deadlineCheck.isPastDue || assignment.allow_late,
    opensAt: new Date(assignment.created_at),
    closesAt: assignment.allow_late ? undefined : dueDate,
    isUrgent
  };
};