'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import {
  GradeSubmissionRequestSchema,
  GradeSubmissionResponseSchema,
  type GradeSubmissionRequest,
  type GradeSubmissionResponse,
} from '../lib/dto';

interface GradeSubmissionParams {
  submissionId: string;
  data: GradeSubmissionRequest;
}

/**
 * 채점 처리
 */
export const useGradeSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GradeSubmissionParams): Promise<GradeSubmissionResponse> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. 요청 데이터 검증
      const validatedData = GradeSubmissionRequestSchema.parse(params.data);

      // 3. API 요청 (x-user-id 헤더)
      const response = await apiClient.post(
        `/api/grading/submissions/${params.submissionId}`,
        {
          json: validatedData,
          headers: {
            'x-user-id': session.user.id,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '채점 처리 중 오류가 발생했습니다');
      }

      // 4. 응답 검증 및 반환
      const result = await response.json();
      return GradeSubmissionResponseSchema.parse(result);
    },
    onSuccess: () => {
      // 제출물 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['grading'] });
      // 과제 상세 쿼리 무효화 (제출 상태 반영)
      queryClient.invalidateQueries({ queryKey: ['assignment'] });
    },
  });
};
