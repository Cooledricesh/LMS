'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AssignmentDetail } from '@/features/assignments/components/AssignmentDetail';
import { useAssignmentDetail } from '@/features/assignments/hooks/useAssignmentDetail';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';
import { apiClient } from '@/lib/remote/api-client';
import { toast } from '@/hooks/use-toast';

interface PageProps {
  params: Promise<{
    id: string;
    assignmentId: string;
  }>;
}

export default function AssignmentDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | undefined>();
  const [resolvedParams, setResolvedParams] = useState<{ id: string; assignmentId: string } | null>(null);

  // Resolve params
  useEffect(() => {
    params.then((p) => setResolvedParams(p));
  }, [params]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const { data: assignment, isLoading, error } = useAssignmentDetail(
    resolvedParams?.assignmentId || '',
    userId
  );

  const handleSubmit = async (values: { content: string; link?: string }) => {
    if (!resolvedParams?.assignmentId) return;

    try {
      const response = await apiClient.post(`/api/submissions`, {
        json: {
          assignmentId: resolvedParams.assignmentId,
          content: values.content,
          link: values.link || null,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to submit assignment');
      }

      toast({
        title: '제출 완료',
        description: '과제가 성공적으로 제출되었습니다.',
      });

      // Refresh the page to show updated submission status
      router.refresh();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      toast({
        title: '제출 실패',
        description: error instanceof Error ? error.message : '과제 제출 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          ← 목록으로 돌아가기
        </button>
      </div>

      <AssignmentDetail
        assignment={assignment!}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
}