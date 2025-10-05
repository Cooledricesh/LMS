'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Book,
  Hash
} from 'lucide-react';
import { formatDate, getDDayFormat, formatAssignmentDueDate } from '@/lib/date';
import { AssignmentStatusBadge, SubmissionStatusBadge } from './AssignmentStatusBadge';
import { SubmissionForm } from './SubmissionForm';
import type { AssignmentDetailResponse } from '@/features/assignments/lib/dto';

interface AssignmentDetailProps {
  assignment: AssignmentDetailResponse;
  isLoading?: boolean;
  error?: Error | null;
  onSubmit?: (values: { content: string; link?: string }) => Promise<void>;
}

export const AssignmentDetail: React.FC<AssignmentDetailProps> = ({
  assignment,
  isLoading,
  error,
  onSubmit,
}) => {
  if (isLoading) {
    return <AssignmentDetailSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>
          과제 정보를 불러오는 중 오류가 발생했습니다: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!assignment) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>과제를 찾을 수 없습니다</AlertTitle>
        <AlertDescription>
          요청하신 과제 정보를 찾을 수 없습니다.
        </AlertDescription>
      </Alert>
    );
  }

  const dueDateInfo = formatAssignmentDueDate(assignment.dueDate);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Book className="h-4 w-4" />
                    {assignment.courseName}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {assignment.instructorName}
                  </span>
                </div>
              </CardDescription>
            </div>
            <AssignmentStatusBadge status={assignment.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">과제 설명</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
            </div>

            <Separator />

            {/* Assignment Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Due Date */}
              <div className="flex items-start space-x-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">마감일</p>
                  <p className="text-sm text-gray-600">{formatDate(assignment.dueDate)}</p>
                  <Badge
                    variant={dueDateInfo.isPastDue ? 'destructive' : dueDateInfo.isUrgent ? 'secondary' : 'default'}
                    className="mt-1"
                  >
                    {dueDateInfo.dDay}
                  </Badge>
                </div>
              </div>

              {/* Weight */}
              <div className="flex items-start space-x-2">
                <Hash className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">점수 비중</p>
                  <p className="text-sm text-gray-600">{assignment.weight}%</p>
                </div>
              </div>

              {/* Late Submission */}
              <div className="flex items-start space-x-2">
                <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">지각 제출</p>
                  <div className="flex items-center gap-1">
                    {assignment.allowLate ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">허용</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600">불가</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Resubmission */}
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium">재제출</p>
                  <div className="flex items-center gap-1">
                    {assignment.allowResubmission ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600">허용</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600">불가</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status Card - Only show if enrolled */}
      {assignment.isEnrolled && assignment.submission && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">제출 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">제출 상태</span>
                <SubmissionStatusBadge
                  status={assignment.submission.status}
                  isLate={assignment.submission.isLate}
                />
              </div>

              {assignment.submission.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">제출 시간</span>
                  <span className="text-sm text-gray-600">
                    {formatDate(assignment.submission.submittedAt)}
                  </span>
                </div>
              )}

              {assignment.submission.score !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">점수</span>
                  <span className="text-sm font-bold">
                    {assignment.submission.score} / 100
                  </span>
                </div>
              )}

              {assignment.submission.feedback && (
                <div>
                  <p className="text-sm font-medium mb-1">피드백</p>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {assignment.submission.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form - Only show if enrolled */}
      {assignment.isEnrolled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">과제 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              assignmentId={assignment.id}
              canSubmit={assignment.canSubmit}
              hasSubmitted={assignment.hasSubmitted}
              allowResubmission={assignment.allowResubmission}
              existingSubmission={assignment.submission ? {
                content: assignment.submission.content,
                link: assignment.submission.link,
                status: assignment.submission.status,
              } : null}
              onSubmit={onSubmit}
            />
          </CardContent>
        </Card>
      )}

      {/* Not Enrolled Alert */}
      {!assignment.isEnrolled && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>수강 등록 필요</AlertTitle>
          <AlertDescription>
            이 과제를 제출하려면 먼저 코스에 등록해야 합니다.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const AssignmentDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};