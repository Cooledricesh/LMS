import { z } from 'zod';
import { PaginationRequestSchema } from '@/lib/pagination';
import { CourseFiltersSchema } from '@/lib/filters';

// Course list request schema
export const CourseListRequestSchema = PaginationRequestSchema.merge(CourseFiltersSchema);

export type CourseListRequest = z.infer<typeof CourseListRequestSchema>;

// Basic course response
export const CourseResponseSchema = z.object({
  id: z.string().uuid(),
  instructorId: z.string().uuid(),
  instructorName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  category: z.string().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  enrollmentCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CourseResponse = z.infer<typeof CourseResponseSchema>;

// Detailed course response with enrollment status
export const CourseDetailResponseSchema = CourseResponseSchema.extend({
  isEnrolled: z.boolean(),
  enrollmentId: z.string().uuid().nullable(),
  assignmentCount: z.number().int().nonnegative(),
});

export type CourseDetailResponse = z.infer<typeof CourseDetailResponseSchema>;

// Database row schemas
export const CourseTableRowSchema = z.object({
  id: z.string().uuid(),
  instructor_id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  category: z.string().nullable(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).nullable(),
  status: z.enum(['draft', 'published', 'archived']),
  created_at: z.string(),
  updated_at: z.string(),
});

export type CourseTableRow = z.infer<typeof CourseTableRowSchema>;

export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['learner', 'instructor']),
});

export type ProfileTableRow = z.infer<typeof ProfileTableRowSchema>;

// Instructor dashboard stats response
export const InstructorDashboardStatsSchema = z.object({
  totalCourses: z.number().int().nonnegative(),
  pendingGrading: z.number().int().nonnegative(),
  totalStudents: z.number().int().nonnegative(),
  todaySubmissions: z.number().int().nonnegative(),
  courses: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    enrollmentCount: z.number().int().nonnegative(),
    assignmentCount: z.number().int().nonnegative(),
  })),
  recentSubmissions: z.array(z.object({
    id: z.string().uuid(),
    assignmentId: z.string().uuid(),
    assignmentTitle: z.string(),
    learnerName: z.string(),
    submittedAt: z.string(),
  })),
});

export type InstructorDashboardStats = z.infer<typeof InstructorDashboardStatsSchema>;