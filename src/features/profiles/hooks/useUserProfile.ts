'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/remote/api-client';
import { ProfileResponseSchema } from '@/features/profiles/lib/dto';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { useEffect, useState } from 'react';

const fetchUserProfile = async () => {
  // Check if user is authenticated first
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    // Not authenticated, don't make API call
    return null;
  }

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
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };

    checkSession();

    // Subscribe to auth state changes
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: fetchUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    enabled: hasSession === true, // Only run query when we have a session
  });
};