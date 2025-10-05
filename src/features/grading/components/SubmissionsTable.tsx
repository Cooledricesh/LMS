'use client';

import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { useSubmissionsForGrading } from '../hooks/useSubmissionsForGrading';
import type { SubmissionForGrading } from '../lib/dto';

interface SubmissionsTableProps {
  assignmentId: string;
  onGradeClick: (submission: SubmissionForGrading) => void;
}

export const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  assignmentId,
  onGradeClick,
}) => {
  const { data: submissions, isLoading, error } = useSubmissionsForGrading(assignmentId);

  const getStatusBadge = (status: SubmissionForGrading['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="default">제출됨</Badge>;
      case 'graded':
        return <Badge className="bg-green-500 hover:bg-green-600">채점완료</Badge>;
      case 'resubmission_required':
        return <Badge className="bg-orange-500 hover:bg-orange-600">재제출요청</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionButton = (submission: SubmissionForGrading) => {
    if (submission.status === 'graded') {
      return (
        <Button size="sm" variant="outline" onClick={() => onGradeClick(submission)}>
          재채점
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => onGradeClick(submission)}>
        채점
      </Button>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error instanceof Error ? error.message : '제출물 목록을 불러올 수 없습니다'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>제출물이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>학습자명</TableHead>
            <TableHead>제출일</TableHead>
            <TableHead>지각여부</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">점수</TableHead>
            <TableHead className="text-right">액션</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">{submission.learnerName}</TableCell>
              <TableCell>
                {format(new Date(submission.submittedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
              </TableCell>
              <TableCell>
                {submission.isLate ? (
                  <Badge variant="destructive">지각</Badge>
                ) : (
                  <Badge variant="secondary">정상</Badge>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(submission.status)}</TableCell>
              <TableCell className="text-right">
                {submission.score !== null ? `${submission.score}점` : '-'}
              </TableCell>
              <TableCell className="text-right">{getActionButton(submission)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
