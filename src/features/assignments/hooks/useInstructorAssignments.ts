'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { InstructorAssignmentListResponseSchema, type InstructorAssignmentListItem } from '../lib/dto';

/**
 * Instructor용 과제 목록 조회
 */
export const useInstructorAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['assignments', 'instructor', courseId],
    queryFn: async (): Promise<InstructorAssignmentListItem[]> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. API 요청
      const response = await apiClient.get(`/api/assignments/instructor/${courseId}`, {
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '과제 목록 조회 중 오류가 발생했습니다');
      }

      // 3. 응답 검증 및 반환
      const result = await response.json();
      return InstructorAssignmentListResponseSchema.parse(result);
    },
    enabled: Boolean(courseId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
