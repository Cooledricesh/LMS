'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { CourseDetailResponseSchema } from '@/features/courses/lib/dto';

const fetchCourseDetail = async (courseId: string, userId?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const response = await apiClient.get(`/api/courses/${courseId}`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch course details');
    }

    const result = await response.json();
    return CourseDetailResponseSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch course details:', error);
    throw error;
  }
};

export const useCourseDetail = (courseId: string, userId?: string) => {
  return useQuery({
    queryKey: ['course', courseId, userId],
    queryFn: () => fetchCourseDetail(courseId, userId),
    enabled: Boolean(courseId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};