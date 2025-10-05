"use client";

import { useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, ClipboardCheck, MessageSquare, LogOut, ArrowRight } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useUserProfile } from "@/features/profiles/hooks/useUserProfile";
import { ROLE_REDIRECT_PATHS } from "@/features/onboarding/constants/roles";

const learnerFeatures = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "코스 탐색 및 수강",
    description: "다양한 카테고리와 난이도의 코스를 검색하고 수강 신청하세요.",
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: "과제 제출",
    description: "마감일 내에 과제를 제출하고 진행 상황을 추적하세요.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "피드백 확인",
    description: "채점된 과제의 점수와 강사의 피드백을 받아보세요.",
  },
];

const instructorFeatures = [
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "코스 개설",
    description: "강의 커리큘럼을 만들고 학습자에게 공유하세요.",
  },
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: "과제 관리",
    description: "과제를 생성하고 제출물을 체계적으로 관리하세요.",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "채점 및 피드백",
    description: "학습자의 과제를 채점하고 피드백을 제공하세요.",
  },
];

export default function Home() {
  const { user, isAuthenticated, isLoading, refresh } = useCurrentUser();
  const { data: profile, isLoading: isProfileLoading } = useUserProfile();
  const router = useRouter();

  // Auto-redirect authenticated users based on their role
  useEffect(() => {
    if (isAuthenticated && profile && !isProfileLoading) {
      const redirectPath = ROLE_REDIRECT_PATHS[profile.role];
      router.replace(redirectPath);
    }
  }, [isAuthenticated, profile, isProfileLoading, router]);

  const handleSignOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/");
  }, [refresh, router]);

  const authActions = useMemo(() => {
    if (isLoading) {
      return (
        <span className="text-sm text-slate-300">세션 확인 중...</span>
      );
    }

    if (isAuthenticated && user) {
      const linkHref = profile ? ROLE_REDIRECT_PATHS[profile.role] : '/dashboard';
      const linkText = profile?.role === 'learner' ? '코스 탐색' :
                       profile?.role === 'instructor' ? '강사 대시보드' :
                       '대시보드';

      return (
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span className="truncate">{user.email ?? "알 수 없는 사용자"}</span>
          <div className="flex items-center gap-2">
            <Link
              href={linkHref}
              className="rounded-md border border-slate-600 px-3 py-1 transition hover:border-slate-400 hover:bg-slate-800"
            >
              {linkText}
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 text-sm">
        <Link
          href="/login"
          className="rounded-md border border-slate-600 px-3 py-1 text-slate-200 transition hover:border-slate-400 hover:bg-slate-800"
        >
          로그인
        </Link>
        <Link
          href="/signup"
          className="rounded-md bg-slate-100 px-3 py-1 text-slate-900 transition hover:bg-white"
        >
          회원가입
        </Link>
      </div>
    );
  }, [handleSignOut, isAuthenticated, isLoading, user, profile]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col px-6 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4 mb-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            <span className="text-lg font-semibold text-slate-100">LMS Platform</span>
          </div>
          {authActions}
        </nav>

        {/* Hero Section */}
        <section className="mb-24 text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            온라인 학습의 새로운 기준
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-300">
            강사와 학습자를 위한 올인원 학습 관리 시스템.<br />
            코스 개설부터 과제 제출, 채점까지 모든 것을 한 곳에서.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-medium transition hover:bg-indigo-700"
            >
              시작하기
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-600 px-6 py-3 text-base font-medium transition hover:border-slate-400 hover:bg-slate-800"
            >
              로그인
            </Link>
          </div>
        </section>

        {/* Learner Features */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">학습자를 위한 기능</h2>
            <p className="text-slate-300">효과적인 학습을 위한 모든 도구</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {learnerFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-slate-600 hover:bg-slate-900/80"
              >
                <div className="mb-4 text-indigo-400">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Instructor Features */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">강사를 위한 기능</h2>
            <p className="text-slate-300">효율적인 강의 운영을 위한 도구</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {instructorFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-700 bg-slate-900/60 p-6 transition hover:border-slate-600 hover:bg-slate-900/80"
              >
                <div className="mb-4 text-emerald-400">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl border border-slate-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
            학습자로 등록하여 다양한 코스를 수강하거나,<br />
            강사로 등록하여 여러분의 지식을 공유하세요.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-medium text-slate-900 transition hover:bg-slate-100"
          >
            무료로 시작하기
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </main>
  );
}
