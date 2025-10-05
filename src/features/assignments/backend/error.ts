export const assignmentErrorCodes = {
  notFound: 'ASSIGNMENT_NOT_FOUND',
  unauthorized: 'ASSIGNMENT_UNAUTHORIZED',
  notEnrolled: 'NOT_ENROLLED_IN_COURSE',
  fetchError: 'ASSIGNMENT_FETCH_ERROR',
  invalidStatus: 'ASSIGNMENT_INVALID_STATUS',
  accessDenied: 'ASSIGNMENT_ACCESS_DENIED',
  courseNotFound: 'COURSE_NOT_FOUND',
} as const;

export type AssignmentServiceError = keyof typeof assignmentErrorCodes;