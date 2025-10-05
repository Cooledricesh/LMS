'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Send, Lock, Loader2 } from 'lucide-react';
import { usePublishAssignment } from '../hooks/usePublishAssignment';
import { useCloseAssignment } from '../hooks/useCloseAssignment';
import type { InstructorAssignmentListItem } from '../lib/dto';

interface AssignmentActionsProps {
  assignment: InstructorAssignmentListItem;
}

export const AssignmentActions: React.FC<AssignmentActionsProps> = ({ assignment }) => {
  const router = useRouter();
  const publishMutation = usePublishAssignment();
  const closeMutation = useCloseAssignment();

  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const handleEdit = () => {
    router.push(`/instructor/courses/${assignment.courseId}/assignments/${assignment.id}/edit`);
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(assignment.id);
      setPublishDialogOpen(false);
    } catch (error) {
      console.error('게시 실패:', error);
    }
  };

  const handleClose = async () => {
    try {
      await closeMutation.mutateAsync(assignment.id);
      setCloseDialogOpen(false);
    } catch (error) {
      console.error('마감 실패:', error);
    }
  };

  const isLoading = publishMutation.isPending || closeMutation.isPending;

  return (
    <div className="flex gap-2">
      {/* Draft 상태: 수정, 게시 */}
      {assignment.status === 'draft' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-1" />
            수정
          </Button>
          <Button
            size="sm"
            onClick={() => setPublishDialogOpen(true)}
            disabled={isLoading}
          >
            <Send className="h-4 w-4 mr-1" />
            게시
          </Button>
        </>
      )}

      {/* Published 상태: 수정, 마감 */}
      {assignment.status === 'published' && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={handleEdit}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-1" />
            수정
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setCloseDialogOpen(true)}
            disabled={isLoading}
          >
            <Lock className="h-4 w-4 mr-1" />
            마감
          </Button>
        </>
      )}

      {/* Closed 상태: 버튼 없음 또는 보기만 */}
      {assignment.status === 'closed' && (
        <div className="text-sm text-gray-500">
          마감됨
        </div>
      )}

      {/* 게시 확인 다이얼로그 */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>과제 게시</AlertDialogTitle>
            <AlertDialogDescription>
              이 과제를 게시하시겠습니까? 게시하면 학습자들이 과제를 볼 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              게시
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 마감 확인 다이얼로그 */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>과제 마감</AlertDialogTitle>
            <AlertDialogDescription>
              이 과제를 마감하시겠습니까? 마감하면 학습자들이 더 이상 제출할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              마감
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
