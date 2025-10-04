export const courseErrorCodes = {
  notFound: 'COURSE_NOT_FOUND',
  fetchError: 'COURSE_FETCH_ERROR',
  invalidParams: 'INVALID_COURSE_PARAMS',
  unauthorized: 'COURSE_UNAUTHORIZED',
} as const;

type CourseErrorValue = (typeof courseErrorCodes)[keyof typeof courseErrorCodes];

export type CourseServiceError = CourseErrorValue;