export const USER_ROLES = {
  LEARNER: 'learner',
  INSTRUCTOR: 'instructor',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_LABELS = {
  [USER_ROLES.LEARNER]: '학습자',
  [USER_ROLES.INSTRUCTOR]: '강사',
} as const;

export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.LEARNER]: '강의를 수강하고 과제를 제출하여 학습을 진행합니다',
  [USER_ROLES.INSTRUCTOR]: '코스를 개설하고 과제를 출제하며 학습자를 지도합니다',
} as const;

export const ROLE_REDIRECT_PATHS = {
  [USER_ROLES.LEARNER]: '/courses',
  [USER_ROLES.INSTRUCTOR]: '/instructor/dashboard',
} as const;