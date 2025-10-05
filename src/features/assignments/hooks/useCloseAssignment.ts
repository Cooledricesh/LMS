'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import {
  AssignmentManagementResponseSchema,
  type AssignmentManagementResponse,
} from '../lib/dto';

/**
 * 과제 마감
 */
export const useCloseAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<AssignmentManagementResponse> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. API 요청
      const response = await apiClient.patch(`/api/assignments/${id}/close`, {
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '과제 마감 중 오류가 발생했습니다');
      }

      // 3. 응답 검증 및 반환
      const result = await response.json();
      return AssignmentManagementResponseSchema.parse(result);
    },
    onSuccess: (data, id) => {
      // 해당 과제 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['assignment', id] });
      // 과제 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });
};
