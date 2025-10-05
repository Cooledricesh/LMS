'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AssignmentStatus = 'draft' | 'published' | 'closed';
type SubmissionStatus = 'submitted' | 'graded' | 'resubmission_required' | 'not_submitted';

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus;
  className?: string;
}

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus;
  isLate?: boolean;
  className?: string;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
  status,
  className
}) => {
  const statusConfig = {
    draft: {
      label: '초안',
      variant: 'secondary' as const,
      className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
    },
    published: {
      label: '진행중',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-700 hover:bg-green-100',
    },
    closed: {
      label: '마감됨',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-700 hover:bg-red-100',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};

export const SubmissionStatusBadge: React.FC<SubmissionStatusBadgeProps> = ({
  status,
  isLate = false,
  className
}) => {
  const statusConfig = {
    not_submitted: {
      label: '미제출',
      variant: 'outline' as const,
      className: 'border-gray-300 text-gray-600',
    },
    submitted: {
      label: isLate ? '지각 제출' : '제출됨',
      variant: 'secondary' as const,
      className: isLate
        ? 'bg-orange-100 text-orange-700 hover:bg-orange-100'
        : 'bg-blue-100 text-blue-700 hover:bg-blue-100',
    },
    graded: {
      label: '채점 완료',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-700 hover:bg-green-100',
    },
    resubmission_required: {
      label: '재제출 요청',
      variant: 'destructive' as const,
      className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
};