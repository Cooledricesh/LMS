"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchLatestTerms } from '@/features/onboarding/lib/api-client';
import type { TermsResponse } from '@/features/terms/lib/dto';

export function useTerms() {
  return useQuery<TermsResponse>({
    queryKey: ['terms', 'latest'],
    queryFn: fetchLatestTerms,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}