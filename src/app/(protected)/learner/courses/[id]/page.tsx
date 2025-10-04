'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { CourseDetail } from '@/features/courses/components/CourseDetail';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;
  const { user } = useCurrentUser();

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(courseId)) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <Link href="/learner/courses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            코스 목록으로 돌아가기
          </Button>
        </Link>
      </div>

      <CourseDetail courseId={courseId} userId={user?.id} />
    </div>
  );
}