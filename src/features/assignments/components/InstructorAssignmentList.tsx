'use client';

import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Plus } from 'lucide-react';
import { useInstructorAssignments } from '../hooks/useInstructorAssignments';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { AssignmentActions } from './AssignmentActions';

interface InstructorAssignmentListProps {
  courseId: string;
}

export const InstructorAssignmentList: React.FC<InstructorAssignmentListProps> = ({
  courseId,
}) => {
  const router = useRouter();
  const { data: assignments, isLoading, error } = useInstructorAssignments(courseId);

  const handleCreate = () => {
    router.push(`/instructor/courses/${courseId}/assignments/new`);
  };

  const handleRowClick = (assignmentId: string) => {
    router.push(`/instructor/assignments/${assignmentId}/submissions`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">과제 목록</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          새 과제 만들기
        </Button>
      </div>

      {!assignments || assignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">아직 생성된 과제가 없습니다</p>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            첫 과제 만들기
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>마감일</TableHead>
                <TableHead>점수 비중</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>제출 현황</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow
                  key={assignment.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleRowClick(assignment.id)}
                >
                  <TableCell className="font-medium">
                    {assignment.title}
                  </TableCell>
                  <TableCell>
                    {format(new Date(assignment.dueDate), 'yyyy-MM-dd HH:mm', { locale: ko })}
                  </TableCell>
                  <TableCell>{assignment.weight}%</TableCell>
                  <TableCell>
                    <AssignmentStatusBadge status={assignment.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-gray-700">{assignment.gradedSubmissions}</span>
                      <span className="text-gray-500"> / {assignment.totalSubmissions}</span>
                      <span className="text-gray-400 ml-1">채점완료</span>
                    </div>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <AssignmentActions assignment={assignment} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
