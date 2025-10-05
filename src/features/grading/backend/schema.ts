import { z } from 'zod';

// 제출물 목록 조회 응답
export const SubmissionForGradingSchema = z.object({
  id: z.string().uuid(),
  assignmentId: z.string().uuid(),
  learnerId: z.string().uuid(),
  learnerName: z.string(),
  content: z.string(),
  link: z.string().nullable(),
  isLate: z.boolean(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().min(0).max(100).nullable(),
  feedback: z.string().nullable(),
  submittedAt: z.string(),
  gradedAt: z.string().nullable(),
});

export type SubmissionForGrading = z.infer<typeof SubmissionForGradingSchema>;

// 채점 요청
export const GradeSubmissionRequestSchema = z.object({
  score: z.number().int().min(0, '점수는 0 이상이어야 합니다').max(100, '점수는 100 이하여야 합니다'),
  feedback: z.string().min(1, '피드백을 입력하세요'),
  requestResubmission: z.boolean().default(false),
});

export type GradeSubmissionRequest = z.infer<typeof GradeSubmissionRequestSchema>;

// 채점 응답
export const GradeSubmissionResponseSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['graded', 'resubmission_required']),
  score: z.number().min(0).max(100),
  gradedAt: z.string(),
});

export type GradeSubmissionResponse = z.infer<typeof GradeSubmissionResponseSchema>;

// Database row schemas
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
  updated_at: z.string(),
});

export type SubmissionRow = z.infer<typeof SubmissionRowSchema>;

export const ProfileRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['learner', 'instructor']),
});

export type ProfileRow = z.infer<typeof ProfileRowSchema>;

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
  updated_at: z.string(),
});

export type AssignmentRow = z.infer<typeof AssignmentRowSchema>;

export const CourseRowSchema = z.object({
  id: z.string().uuid(),
  instructor_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CourseRow = z.infer<typeof CourseRowSchema>;
