import { z } from 'zod';

// Enrollment request schema
export const EnrollmentRequestSchema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type EnrollmentRequest = z.infer<typeof EnrollmentRequestSchema>;

// Enrollment response schema
export const EnrollmentResponseSchema = z.object({
  id: z.string().uuid(),
  courseId: z.string().uuid(),
  learnerId: z.string().uuid(),
  enrolledAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type EnrollmentResponse = z.infer<typeof EnrollmentResponseSchema>;

// Enrollment status schema
export const EnrollmentStatusSchema = z.object({
  isEnrolled: z.boolean(),
  enrollmentId: z.string().uuid().nullable(),
});

export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;

// Database row schema
export const EnrollmentTableRowSchema = z.object({
  id: z.string().uuid(),
  course_id: z.string().uuid(),
  learner_id: z.string().uuid(),
  enrolled_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type EnrollmentTableRow = z.infer<typeof EnrollmentTableRowSchema>;