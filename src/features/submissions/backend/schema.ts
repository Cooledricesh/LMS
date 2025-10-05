import { z } from 'zod';

// 제출 요청 스키마
export const SubmitAssignmentRequestSchema = z.object({
  assignmentId: z.string().uuid('유효하지 않은 과제 ID입니다'),
  content: z.string()
    .min(1, '제출 내용을 입력해주세요')
    .max(5000, '제출 내용은 5000자를 초과할 수 없습니다'),
  link: z.string()
    .url('올바른 URL 형식을 입력해주세요')
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val))
});

export type SubmitAssignmentRequest = z.infer<typeof SubmitAssignmentRequestSchema>;

// 제출 응답 스키마
export const SubmitAssignmentResponseSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['submitted', 'resubmission']),
  isLate: z.boolean(),
  submittedAt: z.string()
});

export type SubmitAssignmentResponse = z.infer<typeof SubmitAssignmentResponseSchema>;

// 제출물 테이블 행 스키마 (DB에서 가져온 데이터 검증용)
export const SubmissionRowSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  learner_id: z.string().uuid(),
  content: z.string(),
  link: z.string().nullable(),
  is_late: z.boolean(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  submitted_at: z.string(),
  graded_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type SubmissionRow = z.infer<typeof SubmissionRowSchema>;

// 과제 테이블 행 스키마 (제출 정책 검증용)
export const AssignmentRowSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  due_date: z.string(),
  weight: z.number(),
  allow_late: z.boolean(),
  allow_resubmission: z.boolean(),
  status: z.enum(['draft', 'published', 'closed']),
  created_at: z.string(),
  updated_at: z.string()
});

export type AssignmentRow = z.infer<typeof AssignmentRowSchema>;