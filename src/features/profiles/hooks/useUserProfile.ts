'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { ProfileResponseSchema } from '@/features/profiles/lib/dto';

const fetchUserProfile = async () => {
  try {
    const response = await apiClient.get('/api/profiles/me');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch profile');
    }

    const result = await response.json();
    return ProfileResponseSchema.parse(result);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};