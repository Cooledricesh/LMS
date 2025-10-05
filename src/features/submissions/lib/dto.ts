/**
 * Frontend에서 사용할 Submission 관련 타입 정의
 * Backend 스키마를 재노출하여 타입 일관성 유지
 */

export type {
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  SubmissionRow,
  AssignmentRow
} from '../backend/schema';

export {
  SubmitAssignmentRequestSchema,
  SubmitAssignmentResponseSchema,
  SubmissionRowSchema,
  AssignmentRowSchema
} from '../backend/schema';