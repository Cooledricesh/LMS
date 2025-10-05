import { z } from 'zod';

// Assignment detail request schema
export const AssignmentDetailRequestSchema = z.object({
  assignmentId: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

export type AssignmentDetailRequest = z.infer<typeof AssignmentDetailRequestSchema>;

// Assignment response schema
export const AssignmentDetailResponseSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  dueDate: z.string(), // ISO string
  weight: z.number().min(0).max(100),
  allowLate: z.boolean(),
  allowResubmission: z.boolean(),
  status: z.enum(['draft', 'published', 'closed']),
  canSubmit: z.boolean(),
  isEnrolled: z.boolean(),
  hasSubmitted: z.boolean(),
  submission: z.object({
    id: z.string().uuid(),
    content: z.string(),
    link: z.string().url().nullable(),
    isLate: z.boolean(),
    status: z.enum(['submitted', 'graded', 'resubmission_required']),
    score: z.number().min(0).max(100).nullable(),
    feedback: z.string().nullable(),
    submittedAt: z.string(),
    gradedAt: z.string().nullable(),
  }).nullable(),
  courseName: z.string(),
  instructorName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AssignmentDetailResponse = z.infer<typeof AssignmentDetailResponseSchema>;

// Database row schemas
export const AssignmentTableRowSchema = z.object({
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

export type AssignmentTableRow = z.infer<typeof AssignmentTableRowSchema>;

export const SubmissionTableRowSchema = z.object({
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

export type SubmissionTableRow = z.infer<typeof SubmissionTableRowSchema>;

// Assignment list schemas for learner dashboard
export const AssignmentListItemSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  courseName: z.string(),
  title: z.string(),
  dueDate: z.string(),
  weight: z.number(),
  status: z.enum(['draft', 'published', 'closed']),
  submissionStatus: z.enum(['not_submitted', 'submitted', 'graded', 'resubmission_required']).nullable(),
  isLate: z.boolean().nullable(),
  score: z.number().nullable(),
});

export type AssignmentListItem = z.infer<typeof AssignmentListItemSchema>;

export const CourseWithInstructorRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  instructor: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }),
});

export type CourseWithInstructorRow = z.infer<typeof CourseWithInstructorRowSchema>;