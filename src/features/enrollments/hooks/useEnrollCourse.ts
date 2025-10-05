'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { EnrollmentResponseSchema, type EnrollmentRequest } from '@/features/enrollments/lib/dto';
import { useToast } from '@/hooks/use-toast';

const enrollInCourse = async (request: EnrollmentRequest) => {
  try {
    const response = await apiClient.post('/api/enrollments', {
      json: request,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to enroll in course');
    }

    const result = await response.json();
    return EnrollmentResponseSchema.parse(result);
  } catch (error) {
    console.error('Failed to enroll in course:', error);
    throw error;
  }
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: enrollInCourse,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['course', variables.courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollment-status'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // 대시보드에서 사용하는 쿼리 키도 무효화
      queryClient.invalidateQueries({ queryKey: ['enrolledCourses'] });

      toast({
        title: '수강신청 완료',
        description: '성공적으로 수강신청이 완료되었습니다.',
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '수강신청에 실패했습니다.';

      toast({
        title: '수강신청 실패',
        description: message,
        variant: 'destructive',
      });
    },
  });
};