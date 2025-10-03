export const onboardingErrorCodes = {
  emailAlreadyExists: 'EMAIL_ALREADY_EXISTS',
  invalidInput: 'INVALID_INPUT',
  profileCreationFailed: 'PROFILE_CREATION_FAILED',
  termsNotAgreed: 'TERMS_NOT_AGREED',
  authSignupFailed: 'AUTH_SIGNUP_FAILED',
  termsAgreementFailed: 'TERMS_AGREEMENT_FAILED',
  validationError: 'VALIDATION_ERROR',
} as const;

type OnboardingErrorValue = (typeof onboardingErrorCodes)[keyof typeof onboardingErrorCodes];

export type OnboardingServiceError = OnboardingErrorValue;