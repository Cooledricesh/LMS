"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signup } from '@/features/onboarding/lib/api-client';
import { ROLE_REDIRECT_PATHS } from '@/features/onboarding/constants/roles';
import { ValidationException, parseZodFormattedError } from '@/features/onboarding/lib/error';
import type { SignupRequest, SignupResponse } from '@/features/onboarding/lib/dto';

interface UseSignupOptions {
  onValidationError?: (errors: Record<string, string>) => void;
}

export function useSignup(options?: UseSignupOptions) {
  const router = useRouter();

  return useMutation<SignupResponse, Error, SignupRequest>({
    mutationFn: signup,
    onSuccess: (data, variables) => {
      toast.success('회원가입이 완료되었습니다!');

      // 역할에 따른 리다이렉트
      const redirectPath = ROLE_REDIRECT_PATHS[variables.role];
      router.push(redirectPath);
    },
    onError: (error) => {
      // Validation 에러 처리 (예상된 에러이므로 console.error 사용하지 않음)
      if (error instanceof ValidationException) {
        const fieldErrors = parseZodFormattedError(error.details);

        // 필드별 에러가 있으면 콜백 호출
        if (Object.keys(fieldErrors).length > 0) {
          options?.onValidationError?.(fieldErrors);

          // 첫 번째 에러 메시지를 토스트로 표시
          const firstError = Object.values(fieldErrors)[0];
          if (firstError) {
            toast.error(firstError);
          }
        } else {
          // 필드별 에러가 없으면 일반 메시지
          toast.error(error.message || '입력 정보를 다시 확인해주세요.');
        }
        return;
      }

      // 예상치 못한 에러만 콘솔에 로깅
      console.error('Unexpected signup error:', error);

      // 일반 에러 처리
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast.error('이미 등록된 이메일입니다.');
      } else {
        toast.error(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });
}