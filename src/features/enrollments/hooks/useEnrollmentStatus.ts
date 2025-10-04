'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { EnrollmentStatusSchema } from '@/features/enrollments/lib/dto';

const fetchEnrollmentStatus = async (courseId: string, userId: string) => {
  try {
    const queryParams = new URLSearchParams({
      courseId,
      userId,
    });

    const response = await apiClient.get(`/api/enrollments/status?${queryParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch enrollment status');
    }

    const result = await response.json();
    return EnrollmentStatusSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch enrollment status:', error);
    throw error;
  }
};

export const useEnrollmentStatus = (courseId: string, userId: string) => {
  return useQuery({
    queryKey: ['enrollment-status', courseId, userId],
    queryFn: () => fetchEnrollmentStatus(courseId, userId),
    enabled: Boolean(courseId && userId),
    staleTime: 30 * 1000, // 30 seconds
  });
};