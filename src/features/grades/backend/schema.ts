import { z } from 'zod';

// 개별 과제 성적 정보
export const GradeItemSchema = z.object({
  assignmentId: z.string().uuid(),
  assignmentTitle: z.string(),
  assignmentWeight: z.number(),
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  submissionId: z.string().uuid().nullable(),
  status: z.enum(['not_submitted', 'submitted', 'graded', 'resubmission_required']),
  score: z.number().min(0).max(100).nullable(),
  feedback: z.string().nullable(),
  isLate: z.boolean(),
  submittedAt: z.string().nullable(),
  gradedAt: z.string().nullable(),
});

export type GradeItem = z.infer<typeof GradeItemSchema>;

// 코스별 총점 정보
export const CourseSummarySchema = z.object({
  courseId: z.string().uuid(),
  courseTitle: z.string(),
  totalScore: z.number().nullable(),
  gradedCount: z.number(),
  totalCount: z.number(),
});

export type CourseSummary = z.infer<typeof CourseSummarySchema>;

// 전체 성적 응답
export const GradesResponseSchema = z.object({
  grades: z.array(GradeItemSchema),
  courseSummaries: z.array(CourseSummarySchema),
});

export type GradesResponse = z.infer<typeof GradesResponseSchema>;

// Database row schemas
export const ProfileRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['learner', 'instructor']),
});

export type ProfileRow = z.infer<typeof ProfileRowSchema>;

export const EnrollmentRowSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  learner_id: z.string().uuid(),
});

export type EnrollmentRow = z.infer<typeof EnrollmentRowSchema>;

export const CourseRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  instructor_id: z.string().uuid(),
});

export type CourseRow = z.infer<typeof CourseRowSchema>;

export const AssignmentRowSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  title: z.string(),
  weight: z.number(),
  status: z.enum(['draft', 'published', 'closed']),
});

export type AssignmentRow = z.infer<typeof AssignmentRowSchema>;

export const SubmissionRowSchema = z.object({
  id: z.string().uuid(),
  assignment_id: z.string().uuid(),
  learner_id: z.string().uuid(),
  status: z.enum(['submitted', 'graded', 'resubmission_required']),
  score: z.number().nullable(),
  feedback: z.string().nullable(),
  is_late: z.boolean(),
  submitted_at: z.string(),
  graded_at: z.string().nullable(),
});

export type SubmissionRow = z.infer<typeof SubmissionRowSchema>;
