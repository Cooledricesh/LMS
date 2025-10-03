import { PASSWORD_RULES, PHONE_NUMBER_RULES, VALIDATION_MESSAGES } from '../constants/validation';

/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: VALIDATION_MESSAGES.EMAIL_REQUIRED };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: VALIDATION_MESSAGES.EMAIL_INVALID };
  }

  return { valid: true };
};

/**
 * 비밀번호 형식 검증
 */
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_REQUIRED };
  }

  if (password.length < PASSWORD_RULES.MIN_LENGTH) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT };
  }

  if (!PASSWORD_RULES.PATTERN.test(password)) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_INVALID };
  }

  return { valid: true };
};

/**
 * 비밀번호 확인 검증
 */
export const validatePasswordConfirm = (
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (!confirmPassword) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_CONFIRM_REQUIRED };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_MISMATCH };
  }

  return { valid: true };
};

/**
 * 이름 검증
 */
export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: VALIDATION_MESSAGES.NAME_REQUIRED };
  }

  if (name.length > 50) {
    return { valid: false, error: VALIDATION_MESSAGES.NAME_TOO_LONG };
  }

  return { valid: true };
};

/**
 * 휴대폰번호 형식 검증
 */
export const validatePhoneNumber = (phoneNumber: string): { valid: boolean; error?: string } => {
  if (!phoneNumber) {
    return { valid: false, error: VALIDATION_MESSAGES.PHONE_REQUIRED };
  }

  // 하이픈 제거 후 검증
  const cleanedNumber = phoneNumber.replace(/-/g, '');

  if (!PHONE_NUMBER_RULES.PATTERN.test(phoneNumber) && !PHONE_NUMBER_RULES.PATTERN.test(cleanedNumber)) {
    return { valid: false, error: VALIDATION_MESSAGES.PHONE_INVALID };
  }

  return { valid: true };
};

/**
 * 휴대폰번호 포맷팅 (하이픈 추가)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');

  // 010-1234-5678 형식
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  }

  // 010-123-4567 형식
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }

  return phoneNumber;
};

/**
 * 모든 필드 검증
 */
export const validateSignupForm = (data: {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phoneNumber: string;
  role?: string;
  termsAgreed?: { service: boolean; privacy: boolean };
}): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!;
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error!;
  }

  const passwordConfirmValidation = validatePasswordConfirm(data.password, data.confirmPassword);
  if (!passwordConfirmValidation.valid) {
    errors.confirmPassword = passwordConfirmValidation.error!;
  }

  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) {
    errors.name = nameValidation.error!;
  }

  const phoneValidation = validatePhoneNumber(data.phoneNumber);
  if (!phoneValidation.valid) {
    errors.phoneNumber = phoneValidation.error!;
  }

  if (!data.role) {
    errors.role = VALIDATION_MESSAGES.ROLE_REQUIRED;
  }

  if (!data.termsAgreed?.service || !data.termsAgreed?.privacy) {
    errors.terms = VALIDATION_MESSAGES.TERMS_REQUIRED;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};