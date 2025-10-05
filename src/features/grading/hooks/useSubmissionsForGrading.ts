'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { SubmissionForGradingSchema, type SubmissionForGrading } from '../lib/dto';
import { z } from 'zod';

const SubmissionsArraySchema = z.array(SubmissionForGradingSchema);

/**
 * 제출물 목록 조회 (instructor 권한)
 */
export const useSubmissionsForGrading = (assignmentId: string) => {
  return useQuery({
    queryKey: ['grading', 'assignments', assignmentId, 'submissions'],
    queryFn: async (): Promise<SubmissionForGrading[]> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. API 요청 (x-user-id 헤더)
      const response = await apiClient.get(
        `/api/grading/assignments/${assignmentId}/submissions`,
        {
          headers: {
            'x-user-id': session.user.id,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '제출물 목록 조회 중 오류가 발생했습니다');
      }

      // 3. 응답 검증 및 반환
      const result = await response.json();
      return SubmissionsArraySchema.parse(result);
    },
    enabled: !!assignmentId,
  });
};
