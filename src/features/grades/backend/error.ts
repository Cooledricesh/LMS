export const gradesErrorCodes = {
  unauthorized: 'UNAUTHORIZED',
  forbidden: 'FORBIDDEN',
  invalidRole: 'INVALID_ROLE',
  noEnrollments: 'NO_ENROLLMENTS',
  databaseError: 'DATABASE_ERROR',
} as const;

export type GradesErrorCode = typeof gradesErrorCodes[keyof typeof gradesErrorCodes];

export type GradesServiceError = GradesErrorCode;
