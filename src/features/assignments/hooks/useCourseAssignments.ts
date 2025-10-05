'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { AssignmentListResponseSchema } from '@/features/assignments/lib/dto';

const fetchCourseAssignments = async (courseId: string, userId?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const response = await apiClient.get(`/api/assignments/course/${courseId}`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch course assignments');
    }

    const result = await response.json();
    return AssignmentListResponseSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch course assignments:', error);
    throw error;
  }
};

export const useCourseAssignments = (courseId: string, userId?: string, enabled = true) => {
  return useQuery({
    queryKey: ['courseAssignments', courseId, userId],
    queryFn: () => fetchCourseAssignments(courseId, userId),
    enabled: Boolean(courseId) && enabled,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};