"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { SignupForm } from "@/features/onboarding/components/SignupForm";
import type { UserRole } from "@/features/onboarding/constants/roles";

type SignupPageProps = {
  params: Promise<Record<string, never>>;
};

export default function SignupPage({ params }: SignupPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) {
      const redirectedFrom = searchParams.get("redirectedFrom") ?? "/";
      router.replace(redirectedFrom);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSignupSuccess = (data: { role: UserRole; email: string }) => {
    // 이메일 확인 안내는 useSignup hook에서 처리
    // 추가적인 처리가 필요한 경우 여기에 구현
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-6 py-16">
      <header className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-semibold">회원가입</h1>
        <p className="text-slate-500">
          LMS 플랫폼에 가입하고 학습을 시작하세요
        </p>
      </header>
      <div className="grid w-full gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-6 shadow-sm">
          <SignupForm onSuccess={handleSignupSuccess} />
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-500 text-center">
              이미 계정이 있으신가요?{" "}
              <Link
                href="/login"
                className="font-medium text-slate-700 underline hover:text-slate-900"
              >
                로그인으로 이동
              </Link>
            </p>
          </div>
        </div>
        <figure className="hidden lg:block overflow-hidden rounded-xl border border-slate-200">
          <Image
            src="https://picsum.photos/seed/signup/640/800"
            alt="회원가입"
            width={640}
            height={800}
            className="h-full w-full object-cover"
            priority
          />
        </figure>
      </div>
    </div>
  );
}
