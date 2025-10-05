"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

type ConfirmEmailPageProps = {
  params: Promise<Record<string, never>>;
};

export default function ConfirmEmailPage({ params }: ConfirmEmailPageProps) {
  void params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.replace("/signup");
    }
  }, [email, router]);

  if (!email) {
    return null;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <Mail className="h-10 w-10 text-slate-600" />
      </div>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold">이메일 확인이 필요합니다</h1>
        <p className="text-slate-600">
          회원가입이 거의 완료되었습니다!
        </p>
      </div>

      <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                <strong className="font-medium">{email}</strong>로 확인 메일을 발송했습니다.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                이메일 받은 편지함을 확인하고 <strong className="font-medium">확인 링크</strong>를 클릭해주세요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700">
                이메일 확인 후 로그인하여 LMS를 시작하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3">
        <Link
          href="/"
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          홈으로 이동
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-800">
            <strong className="font-medium">이메일이 도착하지 않았나요?</strong>
            <br />
            스팸 메일함을 확인하거나, 입력한 이메일 주소가 올바른지 확인해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}
