'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import {
  UpdateAssignmentRequestSchema,
  AssignmentManagementResponseSchema,
  type UpdateAssignmentRequest,
  type AssignmentManagementResponse,
} from '../lib/dto';

interface UpdateAssignmentParams {
  id: string;
  data: UpdateAssignmentRequest;
}

/**
 * 과제 수정
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateAssignmentParams): Promise<AssignmentManagementResponse> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. 요청 데이터 검증
      const validatedData = UpdateAssignmentRequestSchema.parse(params.data);

      // 3. API 요청
      const response = await apiClient.patch(`/api/assignments/${params.id}`, {
        json: validatedData,
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '과제 수정 중 오류가 발생했습니다');
      }

      // 4. 응답 검증 및 반환
      const result = await response.json();
      return AssignmentManagementResponseSchema.parse(result);
    },
    onSuccess: (data, variables) => {
      // 해당 과제 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] });
      // 과제 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['assignments', 'instructor', data.courseId] });
    },
  });
};
