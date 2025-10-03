"use client";

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signup } from '@/features/onboarding/lib/api-client';
import { ROLE_REDIRECT_PATHS } from '@/features/onboarding/constants/roles';
import type { SignupRequest, SignupResponse } from '@/features/onboarding/lib/dto';

export function useSignup() {
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
      console.error('Signup error:', error);

      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        toast.error('이미 등록된 이메일입니다.');
      } else if (error.message.includes('Invalid')) {
        toast.error('입력 정보를 다시 확인해주세요.');
      } else {
        toast.error(error.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      }
    },
  });
}