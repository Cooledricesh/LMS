'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CourseList } from '@/features/courses/components/CourseList';
import { CourseFilter } from '@/features/courses/components/CourseFilter';
import { parseCourseFilterParams } from '@/lib/filters';
import { parsePaginationParams } from '@/lib/pagination';
import type { CourseListRequest } from '@/features/courses/lib/dto';

export default function LearnerCoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse initial filters and pagination from URL
  const [filters, setFilters] = useState<CourseListRequest>(() => {
    const filterParams = parseCourseFilterParams(searchParams);
    const paginationParams = parsePaginationParams(searchParams);

    return {
      ...filterParams,
      ...paginationParams,
      status: 'published' as const, // Always show only published courses
    };
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: CourseListRequest) => {
    const params = new URLSearchParams();

    // Add pagination params
    params.set('page', newFilters.page.toString());
    params.set('limit', newFilters.limit.toString());
    params.set('sort', newFilters.sort);
    params.set('order', newFilters.order);

    // Add filter params if present
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.difficulty) params.set('difficulty', newFilters.difficulty);

    router.push(`/learner/courses?${params.toString()}`);
  }, [router]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<CourseListRequest>) => {
    const updated = {
      ...filters,
      ...newFilters,
      page: 1, // Reset to first page when filters change
      status: 'published' as const, // Ensure status remains published
    };
    setFilters(updated);
    updateURL(updated);
  }, [filters, updateURL]);

  // Handle pagination changes
  const handlePageChange = useCallback((page: number) => {
    const updated = {
      ...filters,
      page,
    };
    setFilters(updated);
    updateURL(updated);
  }, [filters, updateURL]);

  // Sync with browser back/forward navigation
  useEffect(() => {
    const filterParams = parseCourseFilterParams(searchParams);
    const paginationParams = parsePaginationParams(searchParams);

    setFilters({
      ...filterParams,
      ...paginationParams,
      status: 'published' as const,
    });
  }, [searchParams]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">코스 카탈로그</h1>
        <p className="text-muted-foreground">
          다양한 코스를 탐색하고 수강신청하여 학습을 시작하세요.
        </p>
      </div>

      <div className="mb-8">
        <CourseFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <CourseList filters={filters} />

      {/* Pagination Controls */}
      {filters.page && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-4 py-2">
            페이지 {filters.page}
          </span>
          <button
            onClick={() => handlePageChange(filters.page + 1)}
            className="px-4 py-2 border rounded"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}