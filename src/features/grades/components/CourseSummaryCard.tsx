'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CourseSummary } from '../lib/dto';

interface CourseSummaryCardProps {
  summary: CourseSummary;
}

export const CourseSummaryCard = ({ summary }: CourseSummaryCardProps) => {
  const progressPercentage = summary.totalCount > 0
    ? (summary.gradedCount / summary.totalCount) * 100
    : 0;

  const displayScore = summary.totalScore !== null
    ? Math.round(summary.totalScore * 10) / 10
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{summary.courseTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">
            {displayScore !== null ? displayScore : '-'}
          </span>
          {displayScore !== null && (
            <span className="text-xl text-muted-foreground">/ 100점</span>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">채점 진행률</span>
            <span className="font-medium">
              {summary.gradedCount} / {summary.totalCount} 과제
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {progressPercentage === 100 && (
          <div className="text-sm text-green-600 font-medium">
            ✓ 모든 과제 채점 완료
          </div>
        )}
      </CardContent>
    </Card>
  );
};
