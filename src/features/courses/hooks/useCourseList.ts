'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { CourseResponseSchema, type CourseListRequest } from '@/features/courses/lib/dto';
import type { PaginationResponse } from '@/lib/pagination';
import { z } from 'zod';

const PaginatedCoursesSchema = z.object({
  items: z.array(CourseResponseSchema),
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

const fetchCourses = async (params: CourseListRequest) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination params
    queryParams.append('page', params.page.toString());
    queryParams.append('limit', params.limit.toString());
    queryParams.append('sort', params.sort);
    queryParams.append('order', params.order);

    // Add filter params if present
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params.status) queryParams.append('status', params.status);

    const response = await apiClient.get(`/api/courses?${queryParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch courses');
    }

    const result = await response.json();
    return PaginatedCoursesSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    throw error;
  }
};

export const useCourseList = (params: CourseListRequest) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => fetchCourses(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};