'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { GradesResponseSchema, type GradesResponse } from '../lib/dto';

/**
 * 학습자 성적 조회 훅
 */
export const useGrades = () => {
  return useQuery({
    queryKey: ['grades'],
    queryFn: async (): Promise<GradesResponse> => {
      // 1. Supabase session 가져오기
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        throw new Error('인증이 필요합니다');
      }

      // 2. API 요청 (x-user-id 헤더)
      const response = await apiClient.get('/api/grades', {
        headers: {
          'x-user-id': session.user.id,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '성적 조회 중 오류가 발생했습니다');
      }

      // 3. 응답 검증 및 반환
      const result = await response.json();
      return GradesResponseSchema.parse(result);
    },
  });
};
