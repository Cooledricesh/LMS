export const assignmentErrorCodes = {
  notFound: 'ASSIGNMENT_NOT_FOUND',
  unauthorized: 'ASSIGNMENT_UNAUTHORIZED',
  notEnrolled: 'NOT_ENROLLED_IN_COURSE',
  fetchError: 'ASSIGNMENT_FETCH_ERROR',
  invalidStatus: 'ASSIGNMENT_INVALID_STATUS',
  accessDenied: 'ASSIGNMENT_ACCESS_DENIED',
  courseNotFound: 'COURSE_NOT_FOUND',
  // Management errors
  permissionDenied: 'PERMISSION_DENIED',
  invalidDueDate: 'INVALID_DUE_DATE',
  alreadyPublished: 'ALREADY_PUBLISHED',
  alreadyClosed: 'ALREADY_CLOSED',
  cannotEditClosed: 'CANNOT_EDIT_CLOSED',
  cannotCloseDraft: 'CANNOT_CLOSE_DRAFT',
  cannotPublishClosed: 'CANNOT_PUBLISH_CLOSED',
  validationFailed: 'VALIDATION_FAILED',
  createFailed: 'CREATE_FAILED',
  updateFailed: 'UPDATE_FAILED',
  userNotFound: 'USER_NOT_FOUND',
  permissionCheckFailed: 'PERMISSION_CHECK_FAILED',
} as const;

export type AssignmentServiceError = keyof typeof assignmentErrorCodes;