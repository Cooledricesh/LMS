export const enrollmentErrorCodes = {
  alreadyEnrolled: 'ALREADY_ENROLLED',
  enrollmentFailed: 'ENROLLMENT_FAILED',
  courseNotAvailable: 'COURSE_NOT_AVAILABLE',
  unauthorized: 'ENROLLMENT_UNAUTHORIZED',
  notFound: 'ENROLLMENT_NOT_FOUND',
} as const;

type EnrollmentErrorValue = (typeof enrollmentErrorCodes)[keyof typeof enrollmentErrorCodes];

export type EnrollmentServiceError = EnrollmentErrorValue;