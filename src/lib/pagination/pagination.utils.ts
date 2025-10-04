import type { PaginationResponse } from './pagination.schema';

/**
 * Calculate the offset for database queries
 * @param page Current page number (1-indexed)
 * @param limit Number of items per page
 * @returns Offset value for database query
 */
export const calculateOffset = (page: number, limit: number): number => {
  return (page - 1) * limit;
};

/**
 * Create a standardized pagination response
 * @param items Array of items for current page
 * @param total Total number of items
 * @param page Current page number
 * @param limit Items per page
 * @returns Formatted pagination response
 */
export const createPaginationResponse = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginationResponse<T> => {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    total,
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * Parse query parameters for pagination
 * @param searchParams URL search parameters
 * @returns Parsed pagination parameters
 */
export const parsePaginationParams = (searchParams: URLSearchParams) => {
  return {
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: parseInt(searchParams.get('limit') || '10', 10),
    sort: searchParams.get('sort') || 'created_at',
    order: (searchParams.get('order') || 'desc') as 'asc' | 'desc',
  };
};