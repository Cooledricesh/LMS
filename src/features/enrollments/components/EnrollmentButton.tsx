'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useEnrollCourse } from '@/features/enrollments/hooks/useEnrollCourse';
import { useEnrollmentStatus } from '@/features/enrollments/hooks/useEnrollmentStatus';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useDebounce } from 'react-use';

interface EnrollmentButtonProps {
  courseId: string;
  userId: string;
  className?: string;
}

export function EnrollmentButton({ courseId, userId, className }: EnrollmentButtonProps) {
  const [isDebouncing, setIsDebouncing] = useState(false);
  const { data: status, isLoading: statusLoading } = useEnrollmentStatus(courseId, userId);
  const { mutate: enrollInCourse, isPending } = useEnrollCourse();

  // Debounce to prevent multiple clicks
  useDebounce(
    () => {
      setIsDebouncing(false);
    },
    1000,
    [isDebouncing]
  );

  const handleEnroll = () => {
    if (isDebouncing || isPending || status?.isEnrolled) {
      return;
    }

    setIsDebouncing(true);
    enrollInCourse({ courseId, userId });
  };

  // If already enrolled
  if (status?.isEnrolled) {
    return (
      <Button
        className={className}
        disabled
        variant="secondary"
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        수강 중
      </Button>
    );
  }

  // Loading state
  if (statusLoading || isPending) {
    return (
      <Button className={className} disabled>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        {isPending ? '처리 중...' : '확인 중...'}
      </Button>
    );
  }

  // Enroll button
  return (
    <Button
      className={className}
      onClick={handleEnroll}
      disabled={isDebouncing}
    >
      수강신청
    </Button>
  );
}