export const submissionErrorCodes = {
  notEnrolled: 'NOT_ENROLLED',
  assignmentNotFound: 'ASSIGNMENT_NOT_FOUND',
  assignmentNotPublished: 'ASSIGNMENT_NOT_PUBLISHED',
  assignmentClosed: 'ASSIGNMENT_CLOSED',
  pastDueNoLate: 'PAST_DUE_NO_LATE',
  resubmitNotAllowed: 'RESUBMIT_NOT_ALLOWED',
  validationFailed: 'VALIDATION_FAILED',
  submissionFailed: 'SUBMISSION_FAILED',
  invalidUser: 'INVALID_USER',
  databaseError: 'DATABASE_ERROR'
} as const;

type SubmissionErrorValue = (typeof submissionErrorCodes)[keyof typeof submissionErrorCodes];

export type SubmissionServiceError = SubmissionErrorValue;