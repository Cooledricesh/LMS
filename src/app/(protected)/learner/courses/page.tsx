'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { CourseList } from '@/features/courses/components/CourseList';
import { CourseFilter } from '@/features/courses/components/CourseFilter';
import { parseCourseFilterParams } from '@/lib/filters';
import { parsePaginationParams } from '@/lib/pagination';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import type { CourseListRequest } from '@/features/courses/lib/dto';

export default function LearnerCoursesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpdatingFromURL = useRef(false);
  const { user, refresh } = useCurrentUser();

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
    if (isUpdatingFromURL.current) {
      return; // Prevent updating URL when syncing from URL
    }

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

    router.push(`/learner/courses?${params.toString()}`, { scroll: false });
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

  // Handle logout
  const handleLogout = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    await refresh();
    router.replace('/login');
  }, [refresh, router]);

  // Sync with browser back/forward navigation
  useEffect(() => {
    isUpdatingFromURL.current = true;
    const filterParams = parseCourseFilterParams(searchParams);
    const paginationParams = parsePaginationParams(searchParams);

    setFilters({
      ...filterParams,
      ...paginationParams,
      status: 'published' as const,
    });

    // Reset the flag after a short delay
    const timer = setTimeout(() => {
      isUpdatingFromURL.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">코스 카탈로그</h1>
            <p className="text-muted-foreground">
              다양한 코스를 탐색하고 수강신청하여 학습을 시작하세요.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <CourseFilter
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </div>

      <CourseList
        filters={filters}
        onPageChange={handlePageChange}
      />
    </div>
  );
}