import { z } from 'zod';
import { AssignmentListItemSchema } from '@/features/assignments/backend/schema';

// Re-export schemas for frontend use
export {
  AssignmentDetailResponseSchema,
  AssignmentListItemSchema,
  type AssignmentDetailResponse,
  type AssignmentListItem,
} from '@/features/assignments/backend/schema';

// Assignment list response schema
export const AssignmentListResponseSchema = z.array(AssignmentListItemSchema);
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;