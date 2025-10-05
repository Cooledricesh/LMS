import { z } from 'zod';

// 수강 신청 정보 스키마
export const enrollmentSchema = z.object({
  id: z.string().uuid(),
  learner_id: z.string().uuid(),
  course_id: z.string().uuid(),
  progress: z.number().min(0).max(100).default(0),
  enrolled_at: z.string(),
  completed_at: z.string().nullable().optional(),
  last_accessed_at: z.string().nullable().optional(),
});

// 코스 정보를 포함한 수강 신청 정보 스키마
export const enrolledCourseSchema = enrollmentSchema.extend({
  course: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    thumbnail: z.string().nullable().optional(),
    category: z.string(),
    difficulty: z.string(),
    instructor: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  }),
});

// API 응답 스키마
export const enrolledCoursesResponseSchema = z.array(enrolledCourseSchema);

export type Enrollment = z.infer<typeof enrollmentSchema>;
export type EnrolledCourse = z.infer<typeof enrolledCourseSchema>;
export type EnrolledCoursesResponse = z.infer<typeof enrolledCoursesResponseSchema>;