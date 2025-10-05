import { z } from 'zod';
import { AssignmentListItemSchema, InstructorAssignmentListItemSchema } from '@/features/assignments/backend/schema';

// Re-export schemas for frontend use
export {
  AssignmentDetailResponseSchema,
  AssignmentListItemSchema,
  type AssignmentDetailResponse,
  type AssignmentListItem,
  // Management schemas
  CreateAssignmentRequestSchema,
  UpdateAssignmentRequestSchema,
  AssignmentManagementResponseSchema,
  InstructorAssignmentListItemSchema,
  type CreateAssignmentRequest,
  type UpdateAssignmentRequest,
  type AssignmentManagementResponse,
  type InstructorAssignmentListItem,
} from '@/features/assignments/backend/schema';

// Assignment list response schema
export const AssignmentListResponseSchema = z.array(AssignmentListItemSchema);
export type AssignmentListResponse = z.infer<typeof AssignmentListResponseSchema>;

// Instructor assignment list response schema
export const InstructorAssignmentListResponseSchema = z.array(InstructorAssignmentListItemSchema);
export type InstructorAssignmentListResponse = z.infer<typeof InstructorAssignmentListResponseSchema>;