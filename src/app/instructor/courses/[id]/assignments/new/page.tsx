'use client';

import React from 'react';
import { use } from 'react';
import { AssignmentForm } from '@/features/assignments/components/AssignmentForm';

interface NewAssignmentPageProps {
  params: Promise<{ id: string }>;
}

export default function NewAssignmentPage({ params }: NewAssignmentPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">새 과제 만들기</h1>
      <AssignmentForm mode="create" courseId={courseId} />
    </div>
  );
}
