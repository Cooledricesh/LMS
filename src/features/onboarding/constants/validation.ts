export const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  REQUIRE_LETTER: true,
  REQUIRE_NUMBER_OR_SPECIAL: true,
  PATTERN: /^(?=.*[a-zA-Z])(?=.*[\d!@#$%^&*])/,
} as const;

export const PHONE_NUMBER_RULES = {
  PATTERN: /^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/,
  PREFIXES: ['010', '011', '016', '017', '018', '019'],
} as const;

export const VALIDATION_MESSAGES = {
  EMAIL_REQUIRED: '이메일을 입력해주세요',
  EMAIL_INVALID: '올바른 이메일 형식이 아닙니다',
  EMAIL_ALREADY_EXISTS: '이미 등록된 이메일입니다',

  PASSWORD_REQUIRED: '비밀번호를 입력해주세요',
  PASSWORD_TOO_SHORT: `비밀번호는 최소 ${PASSWORD_RULES.MIN_LENGTH}자 이상이어야 합니다`,
  PASSWORD_INVALID: '비밀번호는 영문과 숫자 또는 특수문자를 포함해야 합니다',
  PASSWORD_CONFIRM_REQUIRED: '비밀번호 확인을 입력해주세요',
  PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다',

  NAME_REQUIRED: '이름을 입력해주세요',
  NAME_TOO_SHORT: '이름은 최소 1자 이상이어야 합니다',
  NAME_TOO_LONG: '이름은 최대 50자까지 입력 가능합니다',

  PHONE_REQUIRED: '휴대폰번호를 입력해주세요',
  PHONE_INVALID: '올바른 휴대폰번호 형식이 아닙니다',

  ROLE_REQUIRED: '역할을 선택해주세요',
  ROLE_INVALID: '올바른 역할이 아닙니다',

  TERMS_REQUIRED: '필수 약관에 모두 동의해주세요',
  SERVICE_TERMS_REQUIRED: '서비스 이용약관에 동의해주세요',
  PRIVACY_TERMS_REQUIRED: '개인정보 처리방침에 동의해주세요',
} as const;