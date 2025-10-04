'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, extractApiErrorMessage } from '@/lib/remote/api-client';
import { ExampleResponseSchema } from '@/features/example/lib/dto';

const fetchExample = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/example/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch example');
    }

    // respond 함수는 성공시 데이터를 바로 반환함
    const result = await response.json();
    return ExampleResponseSchema.parse(result);
  } catch (error) {
    const message = extractApiErrorMessage(error, 'Failed to fetch example.');
    throw new Error(message);
  }
};

export const useExampleQuery = (id: string) =>
  useQuery({
    queryKey: ['example', id],
    queryFn: () => fetchExample(id),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
