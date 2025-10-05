'use client';

import { useRouter } from 'next/navigation';
import { useCourseAssignments } from '@/features/assignments/hooks/useCourseAssignments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { format, isPast, isWithinInterval, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AssignmentsListProps {
  courseId: string;
  userId?: string;
  isEnrolled: boolean;
}

const getStatusBadge = (
  status: string,
  submissionStatus: string | null,
  dueDate: string,
  isLate: boolean | null
) => {
  // 과제 상태가 draft거나 closed면 우선 표시
  if (status === 'draft') {
    return <Badge variant="secondary">준비 중</Badge>;
  }
  if (status === 'closed') {
    return <Badge variant="secondary">마감</Badge>;
  }

  // 제출 상태 확인
  if (submissionStatus === 'graded') {
    return <Badge className="bg-green-100 text-green-800">채점 완료</Badge>;
  }
  if (submissionStatus === 'submitted') {
    if (isLate) {
      return <Badge className="bg-orange-100 text-orange-800">지각 제출</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800">제출 완료</Badge>;
  }
  if (submissionStatus === 'resubmission_required') {
    return <Badge className="bg-yellow-100 text-yellow-800">재제출 필요</Badge>;
  }

  // 미제출 상태에서 마감일 체크
  const now = new Date();
  const due = new Date(dueDate);

  if (isPast(due)) {
    return <Badge variant="destructive">미제출</Badge>;
  }

  // 마감 3일 전부터 경고
  const warningDate = subDays(due, 3);
  if (isWithinInterval(now, { start: now, end: due }) && isPast(warningDate)) {
    return <Badge className="bg-yellow-100 text-yellow-800">제출 대기</Badge>;
  }

  return <Badge variant="outline">제출 대기</Badge>;
};

const getDueDateDisplay = (dueDate: string) => {
  const now = new Date();
  const due = new Date(dueDate);

  if (isPast(due)) {
    return {
      text: '마감됨',
      className: 'text-red-600',
      icon: XCircle
    };
  }

  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue <= 3) {
    return {
      text: `D-${daysUntilDue}`,
      className: 'text-orange-600 font-semibold',
      icon: AlertTriangle
    };
  }

  if (daysUntilDue <= 7) {
    return {
      text: `D-${daysUntilDue}`,
      className: 'text-yellow-600',
      icon: Clock
    };
  }

  return {
    text: format(due, 'MM월 dd일', { locale: ko }),
    className: 'text-muted-foreground',
    icon: Calendar
  };
};

export function AssignmentsList({ courseId, userId, isEnrolled }: AssignmentsListProps) {
  const router = useRouter();
  const { data: assignments, isLoading, error } = useCourseAssignments(
    courseId,
    userId,
    isEnrolled // 수강 중인 경우에만 과제 목록 가져오기
  );

  const handleAssignmentClick = (assignmentId: string) => {
    if (isEnrolled) {
      router.push(`/learner/courses/${courseId}/assignments/${assignmentId}`);
    }
  };

  if (!isEnrolled) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-xl">과제 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              이 코스를 수강신청하면 모든 과제에 접근할 수 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">과제 목록</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">과제 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              과제 목록을 불러오는 중 오류가 발생했습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const sortedAssignments = assignments?.sort((a, b) => {
    // 마감일이 가까운 순서대로 정렬
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">과제 목록</CardTitle>
        <CardDescription>
          총 {assignments?.length || 0}개의 과제가 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!sortedAssignments || sortedAssignments.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">아직 등록된 과제가 없습니다.</p>
          </div>
        ) : (
          sortedAssignments.map((assignment) => {
            const dueDateInfo = getDueDateDisplay(assignment.dueDate);
            const DueDateIcon = dueDateInfo.icon;

            return (
              <Card
                key={assignment.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  assignment.status === 'draft' ? 'opacity-60' : ''
                }`}
                onClick={() => handleAssignmentClick(assignment.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-base">{assignment.title}</h4>
                        {getStatusBadge(
                          assignment.status,
                          assignment.submissionStatus,
                          assignment.dueDate,
                          assignment.isLate
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DueDateIcon className="h-3 w-3" />
                          <span className={dueDateInfo.className}>
                            마감: {dueDateInfo.text}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span>배점: {assignment.weight}점</span>
                        </div>

                        {assignment.score !== null && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600 font-medium">
                              {assignment.score}점
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}