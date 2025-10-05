export const gradingErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  assignmentNotFound: 'ASSIGNMENT_NOT_FOUND',
  submissionNotFound: 'SUBMISSION_NOT_FOUND',
  validationFailed: 'VALIDATION_FAILED',
  gradingFailed: 'GRADING_FAILED',
  databaseError: 'DATABASE_ERROR',
  invalidRole: 'INVALID_ROLE',
} as const;

type GradingErrorValue = (typeof gradingErrorCodes)[keyof typeof gradingErrorCodes];

export type GradingServiceError = GradingErrorValue;
