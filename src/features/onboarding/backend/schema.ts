import { z } from 'zod';

// 프로필 생성 요청 스키마 (백엔드 API용)
export const CreateProfileRequestSchema = z.object({
  userId: z.string().uuid({ message: '유효한 사용자 ID가 아닙니다.' }),
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다.' }),
  role: z.enum(['learner', 'instructor'], {
    errorMap: () => ({ message: '역할은 learner 또는 instructor여야 합니다.' })
  }),
  name: z.string().min(1, { message: '이름은 필수입니다.' }),
  phoneNumber: z.string()
    .regex(/^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/,
      { message: '올바른 휴대폰번호 형식이 아닙니다.' }),
  termsAgreed: z.object({
    service: z.boolean(),
    privacy: z.boolean(),
  }),
});

export type CreateProfileRequest = z.infer<typeof CreateProfileRequestSchema>;

// 클라이언트 회원가입 요청 스키마
export const SignupRequestSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 형식이 아닙니다.' }),
  password: z.string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
    .regex(
      /^(?=.*[a-zA-Z])(?=.*[\d!@#$%^&*])/,
      { message: '비밀번호는 영문과 숫자 또는 특수문자를 포함해야 합니다.' }
    ),
  role: z.enum(['learner', 'instructor'], {
    errorMap: () => ({ message: '역할은 learner 또는 instructor여야 합니다.' })
  }),
  name: z.string().min(1, { message: '이름은 필수입니다.' }),
  phoneNumber: z.string()
    .regex(/^(010|011|016|017|018|019)-?\d{3,4}-?\d{4}$/,
      { message: '올바른 휴대폰번호 형식이 아닙니다.' }),
  termsAgreed: z.object({
    service: z.boolean(),
    privacy: z.boolean(),
  }),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;

// 회원가입 응답 스키마
export const SignupResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['learner', 'instructor']),
  name: z.string(),
  phoneNumber: z.string(),
  createdAt: z.string(),
});

export type SignupResponse = z.infer<typeof SignupResponseSchema>;

// 프로필 테이블 스키마
export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['learner', 'instructor']),
  name: z.string(),
  phone_number: z.string(),
  terms_agreed_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileRow = z.infer<typeof ProfileTableRowSchema>;

// 약관 동의 테이블 스키마
export const TermsAgreementRowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  terms_version: z.string(),
  terms_type: z.enum(['service', 'privacy']),
  agreed_at: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string(),
});

export type TermsAgreementRow = z.infer<typeof TermsAgreementRowSchema>;