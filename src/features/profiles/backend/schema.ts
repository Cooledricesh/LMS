import { z } from 'zod';

// Profile response schema
export const ProfileResponseSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['learner', 'instructor']),
  name: z.string(),
  phoneNumber: z.string(),
  termsAgreedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

// Database row schema
export const ProfileTableRowSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['learner', 'instructor']),
  name: z.string(),
  phone_number: z.string(),
  terms_agreed_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type ProfileTableRow = z.infer<typeof ProfileTableRowSchema>;