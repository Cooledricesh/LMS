'use client';

import React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink } from 'lucide-react';
import { GradingForm } from './GradingForm';
import { useGradeSubmission } from '../hooks/useGradeSubmission';
import type { SubmissionForGrading, GradeSubmissionRequest } from '../lib/dto';

interface GradingDialogProps {
  submission: SubmissionForGrading | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GradingDialog: React.FC<GradingDialogProps> = ({
  submission,
  isOpen,
  onClose,
}) => {
  const { mutateAsync } = useGradeSubmission();

  const handleSubmit = async (data: GradeSubmissionRequest) => {
    if (!submission) return;

    await mutateAsync({
      submissionId: submission.id,
      data,
    });

    onClose();
  };

  if (!submission) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>과제 채점</DialogTitle>
          <DialogDescription>학습자의 제출물을 검토하고 채점하세요</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 제출물 정보 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{submission.learnerName}</h3>
                <p className="text-sm text-gray-500">
                  제출일: {format(new Date(submission.submittedAt), 'yyyy-MM-dd HH:mm', { locale: ko })}
                </p>
              </div>
              <div className="flex gap-2">
                {submission.isLate && <Badge variant="destructive">지각</Badge>}
                {submission.status === 'graded' && (
                  <Badge className="bg-green-500 hover:bg-green-600">채점완료</Badge>
                )}
                {submission.status === 'resubmission_required' && (
                  <Badge className="bg-orange-500 hover:bg-orange-600">재제출요청</Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* 제출 내용 */}
            <div>
              <h4 className="text-sm font-semibold mb-2">제출 내용</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="whitespace-pre-wrap text-sm">{submission.content}</p>
              </div>
            </div>

            {/* 제출 링크 */}
            {submission.link && (
              <div>
                <h4 className="text-sm font-semibold mb-2">참고 링크</h4>
                <a
                  href={submission.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  {submission.link}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            {/* 기존 피드백 (재채점 시) */}
            {submission.feedback && (
              <div>
                <h4 className="text-sm font-semibold mb-2">기존 피드백</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="whitespace-pre-wrap text-sm">{submission.feedback}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* 채점 폼 */}
          <GradingForm submission={submission} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
