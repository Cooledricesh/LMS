'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { AssignmentDetailResponseSchema } from '@/features/assignments/lib/dto';

const fetchAssignmentDetail = async (assignmentId: string, userId?: string) => {
  try {
    const headers: Record<string, string> = {};
    if (userId) {
      headers['x-user-id'] = userId;
    }

    const response = await apiClient.get(`/api/assignments/${assignmentId}`, { headers });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch assignment details');
    }

    const result = await response.json();
    return AssignmentDetailResponseSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch assignment details:', error);
    throw error;
  }
};

export const useAssignmentDetail = (assignmentId: string, userId?: string) => {
  return useQuery({
    queryKey: ['assignment', assignmentId, userId],
    queryFn: () => fetchAssignmentDetail(assignmentId, userId),
    enabled: Boolean(assignmentId),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};