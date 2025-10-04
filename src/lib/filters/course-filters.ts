import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

export const CourseFiltersSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type CourseFilters = z.infer<typeof CourseFiltersSchema>;

/**
 * Sanitize search term for database queries
 * @param term Raw search term
 * @returns Sanitized search term
 */
export const sanitizeSearchTerm = (term: string): string => {
  // Remove special characters that could break SQL queries
  return term
    .trim()
    .replace(/[%_]/g, '\\$&') // Escape SQL wildcards
    .replace(/['"]/g, ''); // Remove quotes
};

/**
 * Build filter conditions for course queries
 * @param filters Filter parameters
 * @param query Supabase query builder
 * @returns Modified query with filters applied
 */
export const buildCourseFilterQuery = (
  filters: CourseFilters,
  query: any
) => {
  let filteredQuery = query;

  // Apply search filter
  if (filters.search) {
    const searchTerm = sanitizeSearchTerm(filters.search);
    filteredQuery = filteredQuery.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    );
  }

  // Apply category filter
  if (filters.category) {
    filteredQuery = filteredQuery.eq('category', filters.category);
  }

  // Apply difficulty filter
  if (filters.difficulty) {
    filteredQuery = filteredQuery.eq('difficulty', filters.difficulty);
  }

  // Apply status filter
  if (filters.status) {
    filteredQuery = filteredQuery.eq('status', filters.status);
  }

  return filteredQuery;
};

/**
 * Parse course filter parameters from URL search params
 * @param searchParams URL search parameters
 * @returns Parsed filter parameters
 */
export const parseCourseFilterParams = (searchParams: URLSearchParams): CourseFilters => {
  return {
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    difficulty: searchParams.get('difficulty') as CourseFilters['difficulty'],
    status: searchParams.get('status') as CourseFilters['status'],
  };
};