import { z } from 'zod';

// 약관 조회 응답 스키마
export const TermsResponseSchema = z.object({
  version: z.string(),
  terms: z.array(z.object({
    type: z.enum(['service', 'privacy']),
    title: z.string(),
    content: z.string(),
    required: z.boolean(),
    updatedAt: z.string(),
  })),
});

export type TermsResponse = z.infer<typeof TermsResponseSchema>;

// 약관 내용 (하드코딩된 데이터)
export const TermsContentSchema = z.object({
  type: z.enum(['service', 'privacy']),
  title: z.string(),
  content: z.string(),
  required: z.boolean(),
  updatedAt: z.string(),
});

export type TermsContent = z.infer<typeof TermsContentSchema>;