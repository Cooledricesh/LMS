'use client';

import React from 'react';
import { use } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssignmentForm } from '@/features/assignments/components/AssignmentForm';
import { useAssignmentDetail } from '@/features/assignments/hooks/useAssignmentDetail';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

interface EditAssignmentPageProps {
  params: Promise<{ id: string; assignmentId: string }>;
}

export default function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const assignmentId = resolvedParams.assignmentId;

  // Get current user ID
  const [userId, setUserId] = React.useState<string | undefined>();

  React.useEffect(() => {
    const fetchUserId = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    fetchUserId();
  }, []);

  const { data: assignment, isLoading, error } = useAssignmentDetail(assignmentId, userId);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>과제를 찾을 수 없습니다</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (assignment.status === 'closed') {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>마감된 과제는 수정할 수 없습니다</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Convert AssignmentDetailResponse to AssignmentManagementResponse format
  const initialData = {
    id: assignment.id,
    courseId: assignment.courseId,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    weight: assignment.weight,
    allowLate: assignment.allowLate,
    allowResubmission: assignment.allowResubmission,
    status: assignment.status,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">과제 수정</h1>
      <AssignmentForm mode="edit" courseId={courseId} initialData={initialData} />
    </div>
  );
}
