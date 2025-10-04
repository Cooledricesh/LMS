export const profileErrorCodes = {
  notFound: 'PROFILE_NOT_FOUND',
  fetchError: 'PROFILE_FETCH_ERROR',
  updateError: 'PROFILE_UPDATE_ERROR',
  unauthorized: 'PROFILE_UNAUTHORIZED',
} as const;

type ProfileErrorValue = (typeof profileErrorCodes)[keyof typeof profileErrorCodes];

export type ProfileServiceError = ProfileErrorValue;