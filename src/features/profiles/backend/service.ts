import type { SupabaseClient } from '@supabase/supabase-js';
import { failure, success, type HandlerResult } from '@/backend/http/response';
import {
  ProfileResponseSchema,
  ProfileTableRowSchema,
  type ProfileResponse,
  type ProfileTableRow,
} from '@/features/profiles/backend/schema';
import {
  profileErrorCodes,
  type ProfileServiceError,
} from '@/features/profiles/backend/error';

const PROFILES_TABLE = 'profiles';

/**
 * Get profile by user ID
 */
export const getProfileById = async (
  client: SupabaseClient,
  userId: string
): Promise<HandlerResult<ProfileResponse, ProfileServiceError, unknown>> => {
  try {
    const { data, error } = await client
      .from(PROFILES_TABLE)
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return failure(500, profileErrorCodes.fetchError, error.message);
    }

    if (!data) {
      return failure(404, profileErrorCodes.notFound, 'Profile not found');
    }

    const rowParse = ProfileTableRowSchema.safeParse(data);

    if (!rowParse.success) {
      return failure(
        500,
        profileErrorCodes.fetchError,
        'Profile data validation failed',
        rowParse.error.format()
      );
    }

    const profile: ProfileResponse = {
      id: rowParse.data.id,
      role: rowParse.data.role,
      name: rowParse.data.name,
      phoneNumber: rowParse.data.phone_number,
      termsAgreedAt: rowParse.data.terms_agreed_at,
      createdAt: rowParse.data.created_at,
      updatedAt: rowParse.data.updated_at,
    };

    const validatedProfile = ProfileResponseSchema.safeParse(profile);

    if (!validatedProfile.success) {
      return failure(
        500,
        profileErrorCodes.fetchError,
        'Profile response validation failed',
        validatedProfile.error.format()
      );
    }

    return success(validatedProfile.data);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return failure(500, profileErrorCodes.fetchError, 'Failed to fetch profile');
  }
};