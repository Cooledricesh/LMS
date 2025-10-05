import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  calculateOffset,
  createPaginationResponse,
  type PaginationRequest,
  type PaginationResponse
} from '@/lib/pagination';
import { buildCourseFilterQuery, type CourseFilters } from '@/lib/filters';
import {
  CourseResponseSchema,
  CourseDetailResponseSchema,
  CourseTableRowSchema,
  ProfileTableRowSchema,
  type CourseResponse,
  type CourseDetailResponse,
  type CourseTableRow,
  type ProfileTableRow,
} from '@/features/courses/backend/schema';
import { courseErrorCodes, type CourseServiceError } from '@/features/courses/backend/error';

const COURSES_TABLE = 'courses';
const PROFILES_TABLE = 'profiles';
const ENROLLMENTS_TABLE = 'enrollments';
const ASSIGNMENTS_TABLE = 'assignments';

/**
 * Get paginated list of published courses with filters
 */
export const getCourseList = async (
  client: SupabaseClient,
  filters: CourseFilters,
  pagination: PaginationRequest
): Promise<HandlerResult<PaginationResponse<CourseResponse>, CourseServiceError, unknown>> => {
  try {
    console.log('getCourseList called with:', { filters, pagination });

    // Build base query for published courses
    // Left join으로 변경하여 instructor가 없어도 과목을 가져옴
    let query = client
      .from(COURSES_TABLE)
      .select(`
        *,
        instructor:profiles!left(id, name, role),
        enrollments(count)
      `, { count: 'exact' })
      .eq('status', 'published');

    // Apply filters
    query = buildCourseFilterQuery(filters, query);

    // Apply sorting
    const sortColumn = pagination.sort === 'popularity' ? 'enrollments.count' : pagination.sort;
    query = query.order(sortColumn, { ascending: pagination.order === 'asc' });

    // Apply pagination
    const offset = calculateOffset(pagination.page, pagination.limit);
    query = query.range(offset, offset + pagination.limit - 1);

    const { data, error, count } = await query;

    console.log('Supabase query result:', {
      dataLength: data?.length,
      count,
      error,
      firstItem: data?.[0]
    });

    if (error) {
      console.error('Supabase error:', error);
      return failure(500, courseErrorCodes.fetchError, error.message);
    }

    if (!data) {
      console.log('No data returned from query');
      return success(createPaginationResponse([], 0, pagination.page, pagination.limit));
    }

    // Transform data to response format
    const courses: CourseResponse[] = [];

    for (const row of data) {
      const courseRow = CourseTableRowSchema.safeParse(row);

      if (!courseRow.success) {
        console.error('Course validation failed:', courseRow.error);
        continue;
      }

      // instructor가 null인 경우도 처리
      let instructorName = 'Unknown Instructor';
      if (row.instructor) {
        const instructorRow = ProfileTableRowSchema.safeParse(row.instructor);
        if (instructorRow.success) {
          instructorName = instructorRow.data.name;
        } else {
          console.error('Instructor validation failed:', instructorRow.error);
        }
      }

      // Get enrollment count
      const enrollmentCount = row.enrollments?.[0]?.count || 0;

      const course: CourseResponse = {
        id: courseRow.data.id,
        instructorId: courseRow.data.instructor_id,
        instructorName: instructorName,
        title: courseRow.data.title,
        description: courseRow.data.description,
        thumbnail: courseRow.data.thumbnail,
        category: courseRow.data.category,
        difficulty: courseRow.data.difficulty,
        status: courseRow.data.status,
        enrollmentCount,
        createdAt: courseRow.data.created_at,
        updatedAt: courseRow.data.updated_at,
      };

      const validatedCourse = CourseResponseSchema.safeParse(course);

      if (!validatedCourse.success) {
        console.error('Course response validation failed:', validatedCourse.error);
        continue;
      }

      courses.push(validatedCourse.data);
    }

    return success(createPaginationResponse(courses, count || 0, pagination.page, pagination.limit));
  } catch (error) {
    console.error('Failed to fetch course list:', error);
    return failure(500, courseErrorCodes.fetchError, 'Failed to fetch course list');
  }
};

/**
 * Get course details by ID with enrollment status
 */
export const getCourseById = async (
  client: SupabaseClient,
  courseId: string,
  userId?: string
): Promise<HandlerResult<CourseDetailResponse, CourseServiceError, unknown>> => {
  try {
    // Fetch course with instructor info
    // Left join으로 변경하여 instructor가 없어도 과목을 가져옴
    const { data: courseData, error: courseError } = await client
      .from(COURSES_TABLE)
      .select(`
        *,
        instructor:profiles!left(id, name, role),
        assignments(count),
        enrollments(count)
      `)
      .eq('id', courseId)
      .eq('status', 'published')
      .single();

    if (courseError || !courseData) {
      return failure(404, courseErrorCodes.notFound, 'Course not found');
    }

    const courseRow = CourseTableRowSchema.safeParse(courseData);

    if (!courseRow.success) {
      return failure(500, courseErrorCodes.fetchError, 'Course data validation failed');
    }

    // instructor가 null인 경우도 처리
    let instructorName = 'Unknown Instructor';
    if (courseData.instructor) {
      const instructorRow = ProfileTableRowSchema.safeParse(courseData.instructor);
      if (instructorRow.success) {
        instructorName = instructorRow.data.name;
      } else {
        console.error('Instructor validation failed:', instructorRow.error);
      }
    }

    // Check enrollment status if userId provided
    let isEnrolled = false;
    let enrollmentId: string | null = null;

    if (userId) {
      const { data: enrollmentData } = await client
        .from(ENROLLMENTS_TABLE)
        .select('id')
        .eq('course_id', courseId)
        .eq('learner_id', userId)
        .single();

      if (enrollmentData) {
        isEnrolled = true;
        enrollmentId = enrollmentData.id;
      }
    }

    const enrollmentCount = courseData.enrollments?.[0]?.count || 0;
    const assignmentCount = courseData.assignments?.[0]?.count || 0;

    const courseDetail: CourseDetailResponse = {
      id: courseRow.data.id,
      instructorId: courseRow.data.instructor_id,
      instructorName: instructorName,
      title: courseRow.data.title,
      description: courseRow.data.description,
      thumbnail: courseRow.data.thumbnail,
      category: courseRow.data.category,
      difficulty: courseRow.data.difficulty,
      status: courseRow.data.status,
      enrollmentCount,
      assignmentCount,
      isEnrolled,
      enrollmentId,
      createdAt: courseRow.data.created_at,
      updatedAt: courseRow.data.updated_at,
    };

    const validatedDetail = CourseDetailResponseSchema.safeParse(courseDetail);

    if (!validatedDetail.success) {
      return failure(500, courseErrorCodes.fetchError, 'Course detail validation failed');
    }

    return success(validatedDetail.data);
  } catch (error) {
    console.error('Failed to fetch course by ID:', error);
    return failure(500, courseErrorCodes.fetchError, 'Failed to fetch course details');
  }
};

/**
 * Get enrollment count for a specific course
 */
export const getCourseEnrollmentCount = async (
  client: SupabaseClient,
  courseId: string
): Promise<HandlerResult<number, CourseServiceError, unknown>> => {
  try {
    const { count, error } = await client
      .from(ENROLLMENTS_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (error) {
      return failure(500, courseErrorCodes.fetchError, error.message);
    }

    return success(count || 0);
  } catch (error) {
    console.error('Failed to fetch enrollment count:', error);
    return failure(500, courseErrorCodes.fetchError, 'Failed to fetch enrollment count');
  }
};