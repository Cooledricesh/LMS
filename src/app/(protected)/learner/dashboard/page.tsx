'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { LogOut, BookOpen, Clock, Trophy, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    difficulty: string;
    instructor: {
      name: string;
    };
  };
}

export default function LearnerDashboardPage() {
  const router = useRouter();
  const { user, refresh } = useCurrentUser();

  // 수강 중인 코스 목록 조회
  const { data: enrolledCourses, isLoading } = useQuery({
    queryKey: ['enrolledCourses', user?.id],
    queryFn: async () => {
      const response = await apiClient.get('/api/learner/enrolled-courses');
      const data = await response.json();
      // API 응답이 직접 배열을 반환 (respond 함수가 data를 직접 반환)
      return (Array.isArray(data) ? data : []) as EnrolledCourse[];
    },
    enabled: !!user,
  });

  // 로그아웃 처리
  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/login');
  }, [refresh, router]);

  // 코스 상세 페이지로 이동
  const handleCourseClick = useCallback((courseId: string) => {
    router.push(`/learner/courses/${courseId}`);
  }, [router]);

  // 전체 코스 목록으로 이동
  const handleBrowseCourses = useCallback(() => {
    router.push('/learner/courses');
  }, [router]);

  // 통계 계산
  const stats = {
    totalCourses: enrolledCourses?.length || 0,
    inProgress: enrolledCourses?.filter(c => c.progress > 0 && c.progress < 100)?.length || 0,
    completed: enrolledCourses?.filter(c => c.progress === 100)?.length || 0,
    avgProgress: enrolledCourses?.length
      ? Math.round(enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length)
      : 0,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">학습 대시보드</h1>
            <p className="text-muted-foreground">
              {user?.email}님, 오늘도 열심히 학습해보세요!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBrowseCourses}
              variant="outline"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              코스 둘러보기
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              수강 중인 코스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              진행 중
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              완료
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              평균 진행률
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProgress}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 수강 중인 코스 목록 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">내 학습 코스</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-2 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrolledCourses?.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">아직 수강 중인 코스가 없습니다</h3>
              <p className="text-muted-foreground mb-4">
                새로운 코스를 둘러보고 학습을 시작해보세요!
              </p>
              <Button onClick={handleBrowseCourses}>
                코스 둘러보기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses?.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleCourseClick(enrollment.course_id)}
              >
                <div className="relative h-48">
                  <Image
                    src={enrollment.course.thumbnail || `https://picsum.photos/seed/${enrollment.course_id}/400/200`}
                    alt={enrollment.course.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={enrollment.progress === 100 ? 'default' : 'secondary'}>
                      {enrollment.progress === 100 ? '완료' : `${enrollment.progress}%`}
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{enrollment.course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {enrollment.course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{enrollment.course.instructor.name}</span>
                    <span>•</span>
                    <Badge variant="outline">{enrollment.course.category}</Badge>
                    <Badge variant="outline">{enrollment.course.difficulty}</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">진행률</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(enrollment.enrolled_at), 'yyyy년 MM월 dd일', { locale: ko })}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}