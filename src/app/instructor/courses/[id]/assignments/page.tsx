'use client';

import React from 'react';
import { use } from 'react';
import { InstructorAssignmentList } from '@/features/assignments/components/InstructorAssignmentList';

interface AssignmentsPageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentsPage({ params }: AssignmentsPageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  return (
    <div className="container mx-auto py-8">
      <InstructorAssignmentList courseId={courseId} />
    </div>
  );
}
