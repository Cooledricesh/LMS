'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import {
  SubmitAssignmentRequestSchema,
  SubmitAssignmentResponseSchema,
  type SubmitAssignmentRequest,
  type SubmitAssignmentResponse
} from '../lib/dto';

interface SubmitAssignmentParams {
  assignmentId: string;
  content: string;
  link?: string | null;
}

const submitAssignmentRequest = async (
  params: SubmitAssignmentParams
): Promise<SubmitAssignmentResponse> => {
  try {
    // Supabase에서 현재 사용자 세션 가져오기
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) {
      throw new Error('인증이 필요합니다');
    }

    // 요청 데이터 검증
    const validatedData = SubmitAssignmentRequestSchema.parse({
      assignmentId: params.assignmentId,
      content: params.content,
      link: params.link || null
    });

    // API 요청
    const response = await apiClient.post('/api/submissions', {
      json: validatedData,
      headers: {
        'x-user-id': session.user.id
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '제출 중 오류가 발생했습니다');
    }

    const result = await response.json();
    return SubmitAssignmentResponseSchema.parse(result);
  } catch (error) {
    console.error('과제 제출 실패:', error);
    throw error;
  }
};

export const useSubmitAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAssignmentRequest,
    onSuccess: (data, variables) => {
      // 과제 상세 쿼리 무효화 (제출 상태 반영)
      queryClient.invalidateQueries({
        queryKey: ['assignment', variables.assignmentId]
      });

      // 과제 목록 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['assignments']
      });

      // 학습자 대시보드 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['learner-dashboard']
      });

      console.log('과제 제출 성공:', data);
    },
    onError: (error) => {
      console.error('과제 제출 오류:', error);
    }
  });
};