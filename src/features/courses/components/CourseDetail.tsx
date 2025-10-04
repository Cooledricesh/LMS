'use client';

import { useCourseDetail } from '@/features/courses/hooks/useCourseDetail';
import { EnrollmentButton } from '@/features/enrollments/components/EnrollmentButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, Users, User, Clock, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CourseDetailProps {
  courseId: string;
  userId?: string;
}

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
};

export function CourseDetail({ courseId, userId }: CourseDetailProps) {
  const { data: course, isLoading, error } = useCourseDetail(courseId, userId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          코스 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (!course) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          코스를 찾을 수 없습니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-4">{course.title}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && (
                  <Badge variant="outline">{course.category}</Badge>
                )}
                {course.difficulty && (
                  <Badge className={difficultyColors[course.difficulty]}>
                    {difficultyLabels[course.difficulty]}
                  </Badge>
                )}
              </div>
              <CardDescription className="text-base">
                {course.description || '코스 설명이 없습니다.'}
              </CardDescription>
            </div>
            {userId && (
              <EnrollmentButton
                courseId={courseId}
                userId={userId}
                className="ml-4"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>강사: {course.instructorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>수강생: {course.enrollmentCount}명</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>과제: {course.assignmentCount}개</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">코스 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">커리큘럼</h4>
            <p className="text-muted-foreground">
              이 코스는 {course.assignmentCount}개의 과제로 구성되어 있습니다.
              {course.isEnrolled
                ? ' 수강 중인 코스입니다. 과제 목록에서 진행 상황을 확인하세요.'
                : ' 수강신청 후 모든 과제에 접근할 수 있습니다.'}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">강사 소개</h4>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{course.instructorName}</p>
                <p className="text-sm text-muted-foreground">강사</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">코스 개설일</h4>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(course.createdAt), 'yyyy년 MM월 dd일', { locale: ko })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollment Status */}
      {course.isEnrolled && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            현재 이 코스를 수강 중입니다. 과제 제출 및 성적 확인이 가능합니다.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}