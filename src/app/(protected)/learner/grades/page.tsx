'use client';

import { useGrades } from '@/features/grades/hooks/useGrades';
import { GradesTable } from '@/features/grades/components/GradesTable';
import { CourseSummaryCard } from '@/features/grades/components/CourseSummaryCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function GradesPage() {
  const { data, isLoading, error } = useGrades();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-destructive mb-4">
            {error instanceof Error ? error.message : '오류가 발생했습니다'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-primary hover:underline"
          >
            다시 시도
          </button>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const hasEnrollments = data.courseSummaries.length > 0;
  const hasGrades = data.grades.length > 0;

  if (!hasEnrollments) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center text-muted-foreground">
          등록된 코스가 없습니다
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">내 성적</h1>
        <p className="text-muted-foreground">
          코스별 성적과 과제 피드백을 확인하세요
        </p>
      </div>

      {data.courseSummaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.courseSummaries.map((summary) => (
            <CourseSummaryCard key={summary.courseId} summary={summary} />
          ))}
        </div>
      )}

      {hasGrades ? (
        <GradesTable grades={data.grades} />
      ) : (
        <Card className="p-8 text-center text-muted-foreground">
          아직 과제가 없습니다
        </Card>
      )}
    </div>
  );
}
