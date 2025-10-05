'use client';

import { useMemo } from 'react';
import { CourseCard } from './CourseCard';
import { useCourseList } from '@/features/courses/hooks/useCourseList';
import type { CourseListRequest } from '@/features/courses/lib/dto';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CourseListProps {
  filters: CourseListRequest;
  onPageChange?: (page: number) => void;
}

export function CourseList({ filters, onPageChange }: CourseListProps) {
  const { data, isLoading, error } = useCourseList(filters);

  const courses = useMemo(() => data?.items || [], [data]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-[250px]">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          코스를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  if (!courses.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {filters.search || filters.category || filters.difficulty
            ? '검색 조건에 맞는 코스가 없습니다.'
            : '등록된 코스가 없습니다.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        총 {data?.total || 0}개의 코스
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            href={`/learner/courses/${course.id}`}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {onPageChange && data && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => onPageChange(filters.page - 1)}
            disabled={!data.hasPrev}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="px-4 py-2">
            페이지 {data.page} / {data.totalPages}
          </span>
          <button
            onClick={() => onPageChange(filters.page + 1)}
            disabled={!data.hasNext}
            className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}
    </>
  );
}