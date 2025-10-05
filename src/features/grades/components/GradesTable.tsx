'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/date';
import type { GradeItem } from '../lib/dto';

interface GradesTableProps {
  grades: GradeItem[];
}

const getStatusBadge = (status: GradeItem['status'], isLate: boolean) => {
  if (status === 'not_submitted') {
    return <Badge variant="secondary">미제출</Badge>;
  }

  if (status === 'submitted') {
    return (
      <div className="flex gap-2">
        <Badge variant="outline">채점 대기 중</Badge>
        {isLate && <Badge variant="destructive">지각</Badge>}
      </div>
    );
  }

  if (status === 'graded') {
    return (
      <div className="flex gap-2">
        <Badge variant="default">채점 완료</Badge>
        {isLate && <Badge variant="destructive">지각</Badge>}
      </div>
    );
  }

  if (status === 'resubmission_required') {
    return (
      <div className="flex gap-2">
        <Badge variant="destructive">재제출 요청됨</Badge>
        {isLate && <Badge variant="destructive">지각</Badge>}
      </div>
    );
  }

  return null;
};

export const GradesTable = ({ grades }: GradesTableProps) => {
  if (grades.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        제출한 과제가 없습니다
      </Card>
    );
  }

  // 코스별로 그룹화
  const groupedGrades = grades.reduce((acc, grade) => {
    if (!acc[grade.courseId]) {
      acc[grade.courseId] = {
        courseTitle: grade.courseTitle,
        grades: [],
      };
    }
    acc[grade.courseId].grades.push(grade);
    return acc;
  }, {} as Record<string, { courseTitle: string; grades: GradeItem[] }>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedGrades).map(([courseId, { courseTitle, grades: courseGrades }]) => (
        <div key={courseId} className="space-y-4">
          <h2 className="text-xl font-semibold">{courseTitle}</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>과제명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead className="text-right">점수</TableHead>
                  <TableHead className="text-right">비중</TableHead>
                  <TableHead>피드백</TableHead>
                  <TableHead>제출일</TableHead>
                  <TableHead>채점일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courseGrades.map((grade) => (
                  <TableRow key={grade.assignmentId}>
                    <TableCell className="font-medium">{grade.assignmentTitle}</TableCell>
                    <TableCell>{getStatusBadge(grade.status, grade.isLate)}</TableCell>
                    <TableCell className="text-right">
                      {grade.score !== null ? (
                        <span className="font-semibold">{grade.score}점</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {grade.assignmentWeight}%
                    </TableCell>
                    <TableCell>
                      {grade.feedback ? (
                        <div className="max-w-[300px] break-words" title={grade.feedback}>
                          {grade.feedback}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">피드백 없음</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grade.submittedAt ? (
                        formatDate(grade.submittedAt, 'yyyy년 MM월 dd일 HH:mm')
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grade.gradedAt ? (
                        formatDate(grade.gradedAt, 'yyyy년 MM월 dd일 HH:mm')
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      ))}
    </div>
  );
};
