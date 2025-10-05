"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { LogOut, BookOpen, FileText, Users, Clock } from "lucide-react";

export default function InstructorDashboardPage(props: {
  params: Promise<{}>;
  searchParams: Promise<{}>;
}) {
  const router = useRouter();
  const { user, refresh } = useCurrentUser();

  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace("/login");
  }, [refresh, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                강사 대시보드
              </h1>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                내 코스
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                운영 중인 코스 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                채점 대기
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                미채점 제출물
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                수강생
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                전체 수강생 수
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                최근 제출
              </CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                오늘 제출된 과제
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>내 코스 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>아직 개설한 코스가 없습니다</p>
                <Button className="mt-4" variant="outline">
                  코스 만들기
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 제출물</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>채점 대기 중인 제출물이 없습니다</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Menu (Future) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>빠른 메뉴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                <span className="text-sm">코스 관리</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <FileText className="h-6 w-6" />
                <span className="text-sm">과제 관리</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span className="text-sm">수강생 관리</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Clock className="h-6 w-6" />
                <span className="text-sm">일정 관리</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}