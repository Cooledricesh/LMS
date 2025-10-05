"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useInstructorDashboardStats } from "@/features/courses/hooks/useInstructorDashboardStats";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { LogOut, BookOpen, FileText, Users, ArrowLeft } from "lucide-react";

export default function InstructorCoursesPage(props: {
  params: Promise<{}>;
  searchParams: Promise<{}>;
}) {
  const router = useRouter();
  const { user, refresh } = useCurrentUser();
  const { data: stats, isLoading } = useInstructorDashboardStats();

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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/instructor/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                대시보드로
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                내 코스 관리
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
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            로딩 중...
          </div>
        ) : !stats?.courses || stats.courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              아직 개설한 코스가 없습니다
            </h2>
            <p className="text-gray-500 mb-6">
              코스를 개설하여 학생들을 가르쳐보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      수강생 {course.enrollmentCount}명
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      과제 {course.assignmentCount}개
                    </span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      className="w-full"
                      onClick={() => router.push(`/instructor/courses/${course.id}/assignments`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      과제 관리
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      <Users className="h-4 w-4 mr-2" />
                      수강생 관리
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
